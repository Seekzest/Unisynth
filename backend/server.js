const express = require('express');
const cors = require('cors');
const multer = require('multer');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.params.sessionId;
    const sessionDir = path.join(UPLOAD_DIR, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    cb(null, sessionDir);
  },
  filename: (req, file, cb) => {
    const deviceId = req.body.deviceId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${deviceId}-${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// In-memory session storage
const sessions = new Map();
const wsConnections = new Map();

// Session management
class Session {
  constructor(id, name, creatorId) {
    this.id = id;
    this.name = name;
    this.creatorId = creatorId;
    this.createdAt = new Date();
    this.devices = new Map();
    this.recordings = [];
    this.status = 'waiting'; // waiting, recording, processing, completed
  }

  addDevice(deviceId, deviceInfo) {
    this.devices.set(deviceId, {
      ...deviceInfo,
      joinedAt: new Date(),
      status: 'connected'
    });
  }

  removeDevice(deviceId) {
    this.devices.delete(deviceId);
  }

  addRecording(recording) {
    this.recordings.push(recording);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      createdAt: this.createdAt,
      devices: Array.from(this.devices.entries()).map(([id, info]) => ({
        id,
        ...info
      })),
      recordings: this.recordings,
      status: this.status
    };
  }
}

// WebSocket handling
wss.on('connection', (ws) => {
  const connectionId = uuidv4();
  wsConnections.set(connectionId, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, connectionId, data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    wsConnections.delete(connectionId);
    // Clean up device connections
    sessions.forEach((session) => {
      session.devices.forEach((device, deviceId) => {
        if (device.connectionId === connectionId) {
          session.removeDevice(deviceId);
          broadcastToSession(session.id, {
            type: 'device-left',
            deviceId,
            sessionId: session.id
          });
        }
      });
    });
  });

  ws.send(JSON.stringify({ type: 'connected', connectionId }));
});

function handleWebSocketMessage(ws, connectionId, data) {
  const { type, payload } = data;

  switch (type) {
    case 'join-session':
      handleJoinSession(ws, connectionId, payload);
      break;
    case 'start-recording':
      handleStartRecording(payload);
      break;
    case 'stop-recording':
      handleStopRecording(payload);
      break;
    case 'sync-time':
      handleTimeSync(ws, payload);
      break;
    case 'pose-update':
      handlePoseUpdate(payload);
      break;
    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

function handleJoinSession(ws, connectionId, payload) {
  const { sessionId, deviceId, deviceInfo } = payload;
  const session = sessions.get(sessionId);

  if (!session) {
    ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
    return;
  }

  session.addDevice(deviceId, { ...deviceInfo, connectionId });

  ws.send(JSON.stringify({
    type: 'joined-session',
    session: session.toJSON()
  }));

  broadcastToSession(sessionId, {
    type: 'device-joined',
    deviceId,
    deviceInfo,
    sessionId
  }, connectionId);
}

function handleStartRecording(payload) {
  const { sessionId } = payload;
  const session = sessions.get(sessionId);

  if (session) {
    session.status = 'recording';
    broadcastToSession(sessionId, {
      type: 'recording-started',
      sessionId,
      timestamp: Date.now()
    });
  }
}

function handleStopRecording(payload) {
  const { sessionId } = payload;
  const session = sessions.get(sessionId);

  if (session) {
    session.status = 'processing';
    broadcastToSession(sessionId, {
      type: 'recording-stopped',
      sessionId,
      timestamp: Date.now()
    });
  }
}

function handleTimeSync(ws, payload) {
  ws.send(JSON.stringify({
    type: 'time-sync-response',
    clientTime: payload.clientTime,
    serverTime: Date.now()
  }));
}

function handlePoseUpdate(payload) {
  const { sessionId, deviceId, pose } = payload;
  broadcastToSession(sessionId, {
    type: 'pose-update',
    deviceId,
    pose,
    timestamp: Date.now()
  }, null, true);
}

function broadcastToSession(sessionId, message, excludeConnectionId = null, skipSelf = false) {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.devices.forEach((device, deviceId) => {
    // Skip the excluded connection if skipSelf is true
    if (skipSelf && device.connectionId === excludeConnectionId) return;

    const ws = wsConnections.get(device.connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// REST API endpoints

// Create a new session
app.post('/api/sessions', (req, res) => {
  const { name, creatorId } = req.body;
  const sessionId = uuidv4();
  const session = new Session(sessionId, name, creatorId);
  sessions.set(sessionId, session);

  res.json({
    success: true,
    session: session.toJSON()
  });
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  res.json({
    success: true,
    session: session.toJSON()
  });
});

// List all sessions
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).map(s => s.toJSON());
  res.json({
    success: true,
    sessions: sessionList
  });
});

// Upload video file
app.post('/api/sessions/:sessionId/upload/video', upload.single('video'), (req, res) => {
  const { sessionId } = req.params;
  const { deviceId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const recording = {
    type: 'video',
    deviceId,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    uploadedAt: new Date()
  };

  session.addRecording(recording);

  res.json({
    success: true,
    recording
  });
});

// Upload audio file
app.post('/api/sessions/:sessionId/upload/audio', upload.single('audio'), (req, res) => {
  const { sessionId } = req.params;
  const { deviceId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const recording = {
    type: 'audio',
    deviceId,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    uploadedAt: new Date()
  };

  session.addRecording(recording);

  res.json({
    success: true,
    recording
  });
});

// Upload pose data
app.post('/api/sessions/:sessionId/upload/pose', upload.single('pose'), (req, res) => {
  const { sessionId } = req.params;
  const { deviceId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const recording = {
    type: 'pose',
    deviceId,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    uploadedAt: new Date()
  };

  session.addRecording(recording);

  res.json({
    success: true,
    recording
  });
});

// Upload depth/LiDAR data
app.post('/api/sessions/:sessionId/upload/depth', upload.single('depth'), (req, res) => {
  const { sessionId } = req.params;
  const { deviceId } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const recording = {
    type: 'depth',
    deviceId,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    uploadedAt: new Date()
  };

  session.addRecording(recording);

  res.json({
    success: true,
    recording
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Unisynth backend server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
});
