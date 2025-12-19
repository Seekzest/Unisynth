const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, 'storage');

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const app = express();
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
const server = http.createServer(app);
const io = new socketIo.Server(server, { 
    cors: { 
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*" 
    }
});

const upload = multer({ dest: path.join(STORAGE_DIR, 'uploads/') });

/*
API:
- POST /upload => multipart: video file + metadata JSON string field "metadata"
- The server stores video, writes metadata JSON, and enqueues job (by projectId)

SECURITY NOTE: For production deployment, implement rate limiting on these endpoints
to prevent abuse. Consider using express-rate-limit or similar middleware.
*/

app.post('/upload', upload.single('video'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded');
        }
        
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
        let projectId = (metadata.projectId || 'default').replace(/[^a-zA-Z0-9_-]/g, '');
        if (!projectId || projectId.trim() === '') {
            projectId = 'default';
        }
        
        const projectDir = path.join(STORAGE_DIR, 'projects', projectId);
        if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

        // Sanitize filename to prevent path traversal
        const safeFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const destVideoPath = path.join(projectDir, `${Date.now()}_${safeFilename}`);
        fs.renameSync(file.path, destVideoPath);

        // Write metadata file
        const metaPath = destVideoPath + '.meta.json';
        fs.writeFileSync(metaPath, JSON.stringify({ metadata, uploadedAt: Date.now(), storedPath: destVideoPath }, null, 2));

        // Queue job for processing (simple "when enough files or manual trigger")
        // For demo, we add to a queue file
        enqueueProcessing(projectId, destVideoPath);

        res.status(200).send('OK');
    } catch (e) {
        console.error(e);
        res.status(500).send('Upload Failed');
    }
});

app.get('/projects/:projectId/status', (req, res) => {
    const projectId = req.params.projectId;
    const jobFile = path.join(STORAGE_DIR, 'projects', projectId, 'job.json');
    if (fs.existsSync(jobFile)) {
        res.sendFile(jobFile);
    } else {
        res.json({ status: 'waiting', projectId });
    }
});

io.on('connection', (socket) => {
    console.log('ws connected', socket.id);
    socket.on('joinProject', (projectId) => {
        socket.join(`project-${projectId}`);
    });
});

function enqueueProcessing(projectId, videoPath) {
    const jobFile = path.join(STORAGE_DIR, 'projects', projectId, 'job.json');
    const job = fs.existsSync(jobFile) ? JSON.parse(fs.readFileSync(jobFile)) : { projectId, videos: [], status: 'queued' };
    job.videos.push(videoPath);
    fs.writeFileSync(jobFile, JSON.stringify(job, null, 2));
    // notify watchers
    io.to(`project-${projectId}`).emit('upload', { projectId, videoPath });
    // Optionally trigger worker (example: spawn shell)
    // For demo we just keep job file; processing handled by external worker script which polls storage
}

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
