# Unisynth Setup Guide

This guide will help you get Unisynth up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18 or higher**: [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git**: [Download](https://git-scm.com/)
- **Expo Go app**: Install on your mobile device
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Seekzest/Unisynth.git
cd Unisynth
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configuration:**
- The backend runs on port 3000 by default
- To change the port, set the `PORT` environment variable:
  ```bash
  export PORT=8080
  npm start
  ```

**Start the backend:**
```bash
npm start
```

You should see:
```
Unisynth backend server running on port 3000
Upload directory: /path/to/Unisynth/backend/uploads
```

### 3. Mobile App Setup

Open a new terminal:

```bash
cd mobile
npm install
```

**Configuration:**
- Edit `src/services/api.js`
- Update `API_BASE_URL` to your backend server address
- For local development on the same network:
  ```javascript
  const API_BASE_URL = 'http://YOUR_COMPUTER_IP:3000';
  ```
  Replace `YOUR_COMPUTER_IP` with your computer's local IP address

**Finding your IP address:**
- **Mac/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig` (look for IPv4 Address)

**Start the mobile app:**
```bash
npm start
```

This will:
1. Start the Expo development server
2. Display a QR code in the terminal
3. Open Expo DevTools in your browser

**Running on your phone:**
1. Open Expo Go app on your device
2. Scan the QR code shown in the terminal
3. Wait for the app to load

### 4. 3D Viewer Setup

Open another terminal:

```bash
cd viewer
npm install
```

**Configuration:**
- Edit `main.js`
- Update `API_BASE_URL` if your backend is not on localhost:
  ```javascript
  const API_BASE_URL = 'http://localhost:3000';
  ```

**Start the viewer:**
```bash
npm run dev
```

The viewer will open automatically at `http://localhost:5173`

## Testing the Setup

### 1. Create a Test Session

1. Open the mobile app on your device
2. Enter a session name (e.g., "Test Session")
3. Tap "Create Session"
4. You should see the recording screen

### 2. Connect Multiple Devices (Optional)

1. Open the app on additional devices
2. Tap "Refresh" to see available sessions
3. Select the session you created
4. All connected devices will appear in the device list

### 3. Record a Test Capture

1. Tap "Start Recording" on any device
2. All devices will begin recording simultaneously
3. Record for a few seconds
4. Tap "Stop Recording"
5. Wait for uploads to complete

### 4. View in 3D Viewer

1. Open the viewer in your browser (`http://localhost:5173`)
2. Select your session from the dropdown
3. Click "Load Session"
4. You should see camera positions visualized in 3D

## Troubleshooting

### Mobile app can't connect to backend

**Problem**: "Network request failed" errors

**Solutions:**
1. Ensure your phone and computer are on the same network
2. Check that the backend is running (`http://localhost:3000/health`)
3. Update `API_BASE_URL` in `mobile/src/services/api.js` with your computer's IP
4. Disable any firewall blocking port 3000
5. For iOS, ensure you're using `http://` not `https://` in development

### Camera/Microphone permissions denied

**Problem**: App asks for permissions but they don't work

**Solutions:**
1. Check device settings and ensure permissions are granted
2. Restart the Expo Go app
3. Rebuild the app: Press `r` in the Expo terminal

### WebSocket connection fails

**Problem**: Devices don't sync or show as connected

**Solutions:**
1. Verify backend WebSocket is accessible
2. Check browser console for WebSocket errors
3. Ensure no proxy is blocking WebSocket connections

### Viewer doesn't load sessions

**Problem**: "No sessions available" or loading errors

**Solutions:**
1. Verify backend is running and accessible
2. Check browser console for network errors
3. Update `API_BASE_URL` in `viewer/main.js`
4. Check CORS settings if backend and viewer are on different domains

## Network Configuration

### Same Machine Development
All components can run on `localhost`:
- Backend: `http://localhost:3000`
- Viewer: `http://localhost:5173`
- Mobile: Use your local IP address

### Local Network Development
- Find your computer's local IP (e.g., `192.168.1.100`)
- Backend: `http://192.168.1.100:3000`
- Update mobile app and viewer to use this IP

### Production Deployment
- Deploy backend to a cloud provider (Heroku, AWS, etc.)
- Update mobile app with production backend URL
- Build and deploy viewer as static site
- Use HTTPS and WSS for secure connections

## Next Steps

1. Explore the [Architecture Documentation](ARCHITECTURE.md)
2. Customize the app for your use case
3. Implement 3D reconstruction algorithms
4. Add authentication and user management
5. Deploy to production

## Support

For issues or questions:
- Create an issue on [GitHub](https://github.com/Seekzest/Unisynth/issues)
- Check existing documentation
- Review error logs in console/terminal
