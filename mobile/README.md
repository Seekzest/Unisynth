# Unisynth Mobile App

Cross-platform mobile application for capturing video, audio, and sensor data for 3D reconstruction.

## Features

- **Multi-Device Sessions**: Create or join collaborative recording sessions
- **Video Recording**: High-quality video capture
- **Audio Recording**: Synchronized audio capture
- **Pose Tracking**: Device motion sensors (accelerometer, gyroscope, magnetometer)
- **Real-time Sync**: WebSocket-based synchronization across devices
- **Session Management**: View and join active sessions

## Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing camera features

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure backend URL:
   - Edit `src/services/api.js`
   - Update `API_BASE_URL` to your backend server address

3. Start the development server:
   ```bash
   npm start
   ```

## Running the App

### On iOS Simulator (Mac only)
```bash
npm run ios
```

### On Android Emulator
```bash
npm run android
```

### On Physical Device
1. Install Expo Go app on your device
2. Scan the QR code shown in the terminal

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Permissions

The app requires the following permissions:
- **Camera**: For video recording
- **Microphone**: For audio recording
- **Motion Sensors**: For pose tracking
- **Storage**: For saving recordings

## Architecture

- **React Native**: Cross-platform mobile framework
- **Expo**: Development tooling and native APIs
- **WebSocket**: Real-time communication with backend
- **REST API**: File uploads and session management
