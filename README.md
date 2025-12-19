# Unisynth - Starter (unisynth-starter)

This branch contains a starter dev stack and scaffolds for the Unisynth MVP:
- server/ : Node.js Express ingestion server (presign, /uploads/notify, project state)
- worker/ : Node worker stub that consumes jobs and creates a placeholder manifest
- mobile/android/ : minimal Kotlin ARCore snippet to capture a PLY snapshot and upload via presigned URL
- docker-compose.yml : MinIO + Redis + server + worker for local dev

Preview first: this branch will be opened as `unisynth-starter` for review. Do not push until reviewed.

Quick start (after branch is merged/pushed locally)
1. Copy .env.example to .env and set credentials.
2. docker-compose up -d
3. cd server && npm install && npm start
4. cd worker && npm install && npm start
5. Use mobile/app snippet to request presigned URL and upload artifacts.

See server/README.md and mobile/android/README.md for details.
