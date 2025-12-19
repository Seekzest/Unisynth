# Unisynth Worker

Bash worker script that processes uploaded video segments through the COLMAP/OpenMVS photogrammetry pipeline.

## Features
- Polls for new job files in project directories
- Extracts frames from video segments
- Runs COLMAP feature extraction and matching
- Performs dense reconstruction
- Optional OpenMVS mesh generation and texturing

## Prerequisites

- ffmpeg - For extracting frames from videos
- COLMAP - For structure from motion and dense reconstruction
- OpenMVS (optional) - For mesh generation and texturing
- jq - For JSON parsing

## Setup

1. Install dependencies:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg jq

# COLMAP installation
# Follow instructions at https://colmap.github.io/install.html

# OpenMVS installation (optional)
# Follow instructions at https://github.com/cdcseacave/openMVS
```

2. Make the script executable:
```bash
chmod +x worker.sh
```

3. Run the worker:
```bash
./worker.sh
```

## Environment Variables

- STORAGE_DIR - Directory where uploaded videos and projects are stored (default: ./storage)

## How It Works

1. Worker polls for `job.json` files in `$STORAGE_DIR/projects/*/`
2. When a job is found, it:
   - Extracts frames from video segments (1 fps)
   - Runs COLMAP feature extraction and matching
   - Performs sparse reconstruction
   - Runs dense stereo matching
   - Fuses depth maps into point cloud
   - Optionally generates textured mesh with OpenMVS
3. Outputs are saved to `$STORAGE_DIR/projects/$projectId/output/`
4. Job status is updated to "done"

## Output

The worker produces:
- `fused.ply` - Fused point cloud from dense reconstruction
- `mesh_textured.obj` (optional) - Textured mesh if OpenMVS is available

## Notes

- Processing is compute-intensive and may take significant time
- Ensure sufficient disk space for intermediate files
- The worker runs continuously, processing jobs as they arrive
