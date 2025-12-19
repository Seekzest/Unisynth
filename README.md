# Unisynth

A collaborative mesh/VR camera application that lets multiple phones record a short session (video + audio + pose + optional LiDAR/depth) and stitches those captures into a navigable 3D scene.

## Overview

Unisynth enables multi-device 3D scene capture by coordinating multiple smartphones to simultaneously record from different viewpoints. The captured data is synchronized and can be visualized in an interactive 3D viewer.

## Features

- 📱 **Multi-Device Recording**: Coordinate multiple phones to record simultaneously
- 🎥 **Video Capture**: High-quality video recording from each device
- 🎤 **Audio Recording**: Synchronized audio capture
- 📐 **Pose Tracking**: Device motion and orientation tracking
- 🔍 **Depth Sensing**: Optional LiDAR/depth data capture (iOS)
- 🌐 **Real-time Sync**: WebSocket-based device coordination
- 🎮 **3D Viewer**: Interactive web-based scene visualization

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)
- A modern web browser

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Seekzest/Unisynth.git
   cd Unisynth
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The backend will run on `http://localhost:3000`

3. **Start the mobile app**
   ```bash
   cd mobile
   npm install
   npm start
   ```
   Scan the QR code with Expo Go app on your phone

4. **Start the 3D viewer**
   ```bash
   cd viewer
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser

## Project Structure

```
Unisynth/
├── mobile/          # React Native mobile app
├── backend/         # Node.js backend server
├── viewer/          # Three.js 3D viewer
└── docs/           # Documentation
    └── ARCHITECTURE.md
```

## Usage

1. **Create a Session**
   - Open the Unisynth mobile app
   - Tap "Create Session" and enter a name
   - Share the session with other devices

2. **Join the Session**
   - On other devices, open the app
   - Select the session from the list
   - Wait for all devices to connect

3. **Record**
   - One device taps "Start Recording"
   - All devices begin recording simultaneously
   - Record for up to 60 seconds
   - Tap "Stop Recording" when done

4. **View Results**
   - Open the 3D viewer in a web browser
   - Select your session from the dropdown
   - Click "Load Session" to visualize the capture

## Architecture

Unisynth consists of three main components:

- **Mobile App**: Cross-platform React Native app for capturing video, audio, and sensor data
- **Backend Server**: Node.js server for session coordination and data storage
- **3D Viewer**: Web-based Three.js viewer for 3D scene visualization

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Development

### Backend
```bash
cd backend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npm start
```

### Viewer
```bash
cd viewer
npm install
npm run dev
```

## Technologies

- **Mobile**: React Native, Expo, WebSocket
- **Backend**: Node.js, Express, WebSocket, Multer
- **Viewer**: Three.js, Vite, WebGL
- **Real-time**: WebSocket for device synchronization

## Roadmap

- [ ] Structure-from-Motion 3D reconstruction
- [ ] Point cloud generation from depth data
- [ ] Video texture mapping
- [ ] VR headset support
- [ ] Cloud storage integration
- [ ] Export to standard 3D formats

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Contact

Russell (Seekzest) - [@Seekzest](https://github.com/Seekzest)

Project Link: [https://github.com/Seekzest/Unisynth](https://github.com/Seekzest/Unisynth)

