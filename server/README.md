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
- ALLOWED_ORIGINS - Comma-separated list of allowed CORS origins (default: *)

## Security Considerations

**This is a starter/MVP implementation. For production deployment, consider:**

1. **Rate Limiting**: Add rate limiting middleware (e.g., express-rate-limit) to prevent abuse
2. **Authentication**: Implement proper authentication/authorization for upload endpoints
3. **File Size Limits**: Configure appropriate file size limits in multer
4. **Input Validation**: Add additional validation for metadata fields
5. **HTTPS**: Use HTTPS in production and configure CORS appropriately

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
