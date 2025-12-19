# Unisynth Backend Server

The backend server coordinates multi-device recording sessions and handles file uploads.

## Features

- **Session Management**: Create and manage recording sessions
- **Real-time Coordination**: WebSocket support for device synchronization
- **File Upload**: Handle video, audio, pose, and depth data uploads
- **Device Tracking**: Monitor connected devices and their status

## API Endpoints

### Sessions

- `POST /api/sessions` - Create a new recording session
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:sessionId` - Get session details

### File Uploads

- `POST /api/sessions/:sessionId/upload/video` - Upload video file
- `POST /api/sessions/:sessionId/upload/audio` - Upload audio file
- `POST /api/sessions/:sessionId/upload/pose` - Upload pose data
- `POST /api/sessions/:sessionId/upload/depth` - Upload depth/LiDAR data

### WebSocket Events

- `join-session` - Join a recording session
- `start-recording` - Start recording on all devices
- `stop-recording` - Stop recording on all devices
- `sync-time` - Synchronize time across devices
- `pose-update` - Real-time pose updates

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server runs on port 3000 by default. Set the `PORT` environment variable to use a different port.

## Environment Variables

- `PORT` - Server port (default: 3000)
