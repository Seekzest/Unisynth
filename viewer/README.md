# Unisynth 3D Viewer

Web-based 3D viewer for visualizing Unisynth recording sessions.

## Features

- **3D Scene Visualization**: View camera positions and recordings in 3D space
- **Session Browser**: Select and load different recording sessions
- **Camera Frustums**: Visualize camera positions and orientations
- **Point Cloud Display**: Preview reconstructed 3D data
- **Interactive Controls**: Orbit, pan, and zoom the 3D scene

## Prerequisites

- Node.js 18+
- A running Unisynth backend server

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure backend URL:
   - Edit `main.js`
   - Update `API_BASE_URL` to match your backend server

3. Start the development server:
   ```bash
   npm run dev
   ```

The viewer will open at `http://localhost:5173`

## Controls

- **Left Click + Drag**: Rotate the camera around the scene
- **Right Click + Drag**: Pan the camera
- **Scroll Wheel**: Zoom in/out

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Architecture

- **Three.js**: 3D rendering engine
- **Vite**: Build tool and development server
- **WebGL**: Hardware-accelerated 3D graphics

## Features Roadmap

- [ ] Load and display actual video textures
- [ ] Real-time 3D reconstruction preview
- [ ] Point cloud from depth/LiDAR data
- [ ] Multiple viewpoint playback
- [ ] Export reconstructed models
