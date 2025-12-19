# Unisynth Quick Reference

## Commands Cheat Sheet

### Starting the System

**Quick Start (All Components):**
```bash
./start.sh
```

**Individual Components:**
```bash
# Backend (port 3000)
cd backend && npm start

# Viewer (port 5173)
cd viewer && npm run dev

# Mobile App
cd mobile && npm start
```

### Development

**Install Dependencies:**
```bash
# All at once
npm run install:all

# Individual
cd backend && npm install
cd mobile && npm install
cd viewer && npm install
```

**Clean Install:**
```bash
npm run clean
npm run install:all
```

### Testing Backend

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Create Session:**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Session","creatorId":"device-1"}'
```

**List Sessions:**
```bash
curl http://localhost:3000/api/sessions
```

## URLs

| Component | URL |
|-----------|-----|
| Backend API | http://localhost:3000 |
| Backend Health | http://localhost:3000/health |
| 3D Viewer | http://localhost:5173 |
| Mobile App | Scan QR in terminal |

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Backend server configuration |
| `mobile/src/services/api.js` | API endpoint configuration |
| `viewer/main.js` | Viewer API configuration |
| `mobile/app.json` | Mobile app settings |

## Key API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details

### Uploads
- `POST /api/sessions/:id/upload/video` - Upload video
- `POST /api/sessions/:id/upload/audio` - Upload audio
- `POST /api/sessions/:id/upload/pose` - Upload pose data
- `POST /api/sessions/:id/upload/depth` - Upload depth data

### WebSocket Events

**Client → Server:**
- `join-session` - Join a session
- `start-recording` - Start recording
- `stop-recording` - Stop recording
- `sync-time` - Sync device time
- `pose-update` - Send pose update

**Server → Client:**
- `connected` - Connection established
- `joined-session` - Joined successfully
- `device-joined` - New device joined
- `device-left` - Device disconnected
- `recording-started` - Recording started
- `recording-stopped` - Recording stopped

## Mobile App Screens

1. **Home Screen**
   - Create new session
   - View/join existing sessions
   - Session list with device counts

2. **Session Screen**
   - Camera preview
   - Connected devices list
   - Recording controls
   - Real-time sync indicators

## Viewer Controls

- **Rotate:** Left click + drag
- **Pan:** Right click + drag
- **Zoom:** Scroll wheel
- **Reset:** Refresh page

## Common Tasks

### Change Backend Port
```bash
# In terminal
export PORT=8080
cd backend && npm start
```

### Update API URL for Mobile
Edit `mobile/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:3000';
```

### Update API URL for Viewer
Edit `viewer/main.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### Find Your Local IP
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

## Troubleshooting

### Mobile can't connect
1. Check backend is running: `curl http://localhost:3000/health`
2. Update API_BASE_URL to your computer's IP
3. Ensure phone and computer on same network
4. Check firewall settings

### WebSocket fails
1. Verify backend is running
2. Check browser console for errors
3. Try refreshing the page

### Camera/microphone not working
1. Check app permissions in device settings
2. Restart Expo Go app
3. Clear app cache

### Upload fails
1. Check file size (default limit: 100MB)
2. Verify backend storage is writable
3. Check backend logs for errors

## File Locations

- **Uploads:** `backend/uploads/[session-id]/`
- **Logs:** Console output (use `tee` to save)
- **Cache:** `mobile/.expo/` (can be deleted)

## Build Commands

### Viewer Production Build
```bash
cd viewer
npm run build
# Output in: dist/
```

### Mobile App Builds
```bash
cd mobile

# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Environment Variables

### Backend
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `UPLOAD_DIR` - Upload directory path

### Mobile
- Configure in `app.json`

## Documentation

- **Setup Guide:** [docs/SETUP.md](docs/SETUP.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Deployment:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project Summary:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## Support

- **Issues:** https://github.com/Seekzest/Unisynth/issues
- **Docs:** `/docs` directory
- **Examples:** See PROJECT_SUMMARY.md

## Version Info

- **Current Version:** 1.0.0
- **Node.js Required:** 18+
- **License:** MIT

---

For detailed information, see the full documentation in the `/docs` folder.
