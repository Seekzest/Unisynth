# Unisynth Architecture

## Overview

Unisynth is a collaborative mesh/VR camera application that enables multiple mobile devices to simultaneously record video, audio, pose data, and depth information, which is then synthesized into a navigable 3D scene.

## System Components

### 1. Mobile App (`/mobile`)
- **Technology**: React Native with Expo
- **Purpose**: Capture video, audio, and sensor data from mobile devices
- **Key Features**:
  - Multi-device session management
  - Synchronized video/audio recording
  - Real-time pose tracking (accelerometer, gyroscope, magnetometer)
  - Optional LiDAR/depth capture (iOS)
  - WebSocket-based real-time coordination

### 2. Backend Server (`/backend`)
- **Technology**: Node.js with Express and WebSocket
- **Purpose**: Coordinate recording sessions and store captured data
- **Key Features**:
  - Session creation and management
  - Real-time device synchronization
  - File upload handling (video, audio, pose, depth)
  - WebSocket communication for device coordination
  - In-memory session state management

### 3. 3D Viewer (`/viewer`)
- **Technology**: Three.js with Vite
- **Purpose**: Visualize and navigate reconstructed 3D scenes
- **Key Features**:
  - 3D scene rendering
  - Camera frustum visualization
  - Point cloud display
  - Interactive navigation controls
  - Session selection and loading

## Data Flow

```
[Mobile Device 1] ─┐
                   ├─> [Backend Server] <─> [3D Viewer]
[Mobile Device 2] ─┤
                   │
[Mobile Device N] ─┘
```

### Recording Session Flow

1. **Session Creation**
   - User creates a session from any mobile device
   - Backend generates a unique session ID
   - Session is broadcast to all connected clients

2. **Device Connection**
   - Multiple devices join the session via WebSocket
   - Backend tracks connected devices
   - Devices are synchronized via time sync protocol

3. **Recording**
   - Host initiates recording on all devices simultaneously
   - Each device records:
     - Video (H.264)
     - Audio (AAC)
     - Pose data (JSON with sensor readings)
     - Depth/LiDAR data (if available)
   - Real-time pose updates sent via WebSocket

4. **Upload**
   - Recording stops on all devices
   - Each device uploads its data to the backend
   - Files stored in session-specific directories

5. **Visualization**
   - Viewer loads session data from backend
   - Displays camera positions and orientations
   - Renders point cloud and 3D reconstruction

## API Specification

### REST Endpoints

#### Sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:sessionId` - Get session details

#### Uploads
- `POST /api/sessions/:sessionId/upload/video` - Upload video file
- `POST /api/sessions/:sessionId/upload/audio` - Upload audio file
- `POST /api/sessions/:sessionId/upload/pose` - Upload pose data
- `POST /api/sessions/:sessionId/upload/depth` - Upload depth data

### WebSocket Events

#### Client -> Server
- `join-session` - Join a recording session
- `start-recording` - Initiate recording on all devices
- `stop-recording` - Stop recording on all devices
- `sync-time` - Request time synchronization
- `pose-update` - Send real-time pose update

#### Server -> Client
- `connected` - Connection established
- `joined-session` - Successfully joined session
- `device-joined` - Another device joined
- `device-left` - A device disconnected
- `recording-started` - Recording has started
- `recording-stopped` - Recording has stopped
- `time-sync-response` - Time sync response
- `pose-update` - Pose update from another device

## Data Formats

### Pose Data (JSON)
```json
[
  {
    "timestamp": 1234567890,
    "type": "accelerometer",
    "data": { "x": 0.1, "y": 0.2, "z": 9.8 }
  },
  {
    "timestamp": 1234567890,
    "type": "gyroscope",
    "data": { "x": 0.01, "y": 0.02, "z": 0.03 }
  }
]
```

### Session Object
```json
{
  "id": "uuid",
  "name": "My Recording",
  "creatorId": "device-id",
  "createdAt": "2024-01-01T00:00:00Z",
  "devices": [
    {
      "id": "device-id",
      "model": "iPhone 14 Pro",
      "platform": "mobile",
      "status": "connected"
    }
  ],
  "recordings": [
    {
      "type": "video",
      "deviceId": "device-id",
      "filename": "video.mp4",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "status": "waiting|recording|processing|completed"
}
```

## Deployment

### Development
Each component can be run independently in development mode:

```bash
# Backend
cd backend && npm start

# Mobile (requires Expo)
cd mobile && npm start

# Viewer
cd viewer && npm run dev
```

### Production
- **Backend**: Deploy to any Node.js hosting (Heroku, AWS, etc.)
- **Mobile**: Build with Expo and publish to app stores
- **Viewer**: Build static files and deploy to any web host

## Future Enhancements

1. **3D Reconstruction**
   - Structure-from-Motion (SfM) pipeline
   - Multi-view stereo reconstruction
   - Depth map fusion

2. **Real-time Processing**
   - Live 3D preview during recording
   - On-device pose estimation using ARKit/ARCore
   - Edge-based preprocessing

3. **Advanced Features**
   - VR headset support for viewing
   - Photogrammetry texture mapping
   - Neural radiance fields (NeRF)
   - Export to standard 3D formats (OBJ, FBX, GLTF)

4. **Collaboration**
   - Cloud storage integration
   - Project sharing
   - Multi-user viewing

## Security Considerations

- Use HTTPS/WSS in production
- Implement authentication and authorization
- Add rate limiting for uploads
- Sanitize file uploads
- Implement session expiration
- Add CORS configuration
