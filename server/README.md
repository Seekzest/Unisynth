# Unisynth Server

Node.js Express server for ingesting video uploads and managing project state.

## Features
- POST /upload - Accepts multipart video uploads with metadata
- GET /projects/:projectId/status - Get project processing status
- WebSocket support for real-time upload notifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Server will run on port 4000 by default (or PORT env variable)

## Environment Variables

- PORT - Server port (default: 4000)
- STORAGE_DIR - Directory for storing uploaded videos and project data
- REDIS_URL - Optional Redis URL for queue management

## API Endpoints

### POST /upload
Upload a video segment with metadata.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Fields:
  - video: video file (mp4)
  - metadata: JSON string with projectId, timestamp, location, etc.

**Response:**
- 200 OK - Upload successful
- 500 Error - Upload failed

### GET /projects/:projectId/status
Get the current status of a project.

**Response:**
```json
{
  "projectId": "demo-project",
  "status": "queued",
  "videos": [...]
}
```
