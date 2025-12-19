#!/usr/bin/env bash
# Worker script: poll for projects with job.json and run COLMAP/OpenMVS pipeline.
# Replace paths with your install locations; ensure COLMAP and OpenMVS are in PATH.

STORAGE_DIR="${STORAGE_DIR:-$(pwd)/storage}"
WORK_DIR="$STORAGE_DIR/processing"
mkdir -p "$WORK_DIR"

echo "Worker started. Monitoring $STORAGE_DIR/projects for jobs..."

while true; do
  for job in "$STORAGE_DIR"/projects/*/job.json; do
    [ -e "$job" ] || continue
    dir=$(dirname "$job")
    projectId=$(basename "$dir")
    echo "Found job for project: $projectId"
    # Load job using a unique temporary file
    tmpfile=$(mktemp)
    jq -r '.videos[]' "$job" > "$tmpfile"
    pwd_move="$WORK_DIR/$projectId"
    mkdir -p "$pwd_move"
    # Copy videos to working folder (or symlink)
    while read -r v; do
      cp "$v" "$pwd_move/"
    done < "$tmpfile"
    rm "$tmpfile"

    cd "$pwd_move" || { echo "Error: Failed to change directory to $pwd_move"; continue; }
    echo "Extract frames (one frame per second)"
    mkdir -p images
    for f in *.mp4; do
      ffmpeg -i "$f" -vf "fps=1" images/${f%.*}_%05d.jpg
    done

    echo "Run COLMAP feature extraction and matching"
    # Create COLMAP project
    COLMAP_DATABASE=db
    mkdir -p colmap
    # feature extraction
    colmap feature_extractor --database_path $COLMAP_DATABASE --image_path images
    colmap exhaustive_matcher --database_path $COLMAP_DATABASE
    mkdir -p sparse
    colmap mapper --database_path $COLMAP_DATABASE --image_path images --output_path sparse

    echo "Convert sparse to dense and run OpenMVS or COLMAP dense"
    mkdir -p dense
    # Use COLMAP patch_match_stereo + stereo_fusion or OpenMVS pipeline
    colmap image_undistorter --image_path images --input_path sparse/0 --output_path dense --output_type COLMAP --max_image_size 2000
    colmap patch_match_stereo --workspace_path dense --workspace_format COLMAP --PatchMatchStereo.geom_consistency true
    colmap stereo_fusion --workspace_path dense --workspace_format COLMAP --input_type geometric --output_path dense/fused.ply

    # Optional: convert to mesh via OpenMVS or Poisson recon
    # Assuming OpenMVS is installed and you want .obj/.ply and texturing
    if command -v DensifyPointCloud >/dev/null 2>&1; then
      echo "Running OpenMVS pipeline"
      DensifyPointCloud dense/scene.mvs -o dense/densified.mvs
      ReconstructMesh dense/densified.mvs -o dense/mesh.mvs
      RefineMesh dense/mesh.mvs -o dense/mesh_refined.mvs
      TextureMesh dense/mesh_refined.mvs -o dense/mesh_textured.obj
      # Convert to glTF (or use obj2gltf)
    fi

    # Convert fused.ply to glTF with external tooling, e.g. Blender or obj2gltf.
    # Place result at $STORAGE_DIR/projects/$projectId/output/model.gltf
    mkdir -p "$STORAGE_DIR/projects/$projectId/output"
    cp dense/fused.ply "$STORAGE_DIR/projects/$projectId/output/fused.ply"

    # mark job done
    jq '. + {status:"done", completedAt:'"$(date +%s)"'}' "$job" > "$job.tmp" && mv "$job.tmp" "$job"
    echo "Job $projectId processed."
  done
  sleep 20
done
