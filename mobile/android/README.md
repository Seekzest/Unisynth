# Unisynth Android App

Android application for capturing video segments with CameraX and uploading them to the Unisynth server.

## Features
- Video recording with CameraX
- Location tracking
- Background uploads with WorkManager
- Metadata collection (device, camera, location, timestamp)

## Prerequisites
- Android Studio
- Android SDK 24+ (Android 7.0+)
- Physical device or emulator with camera support

## Setup

1. Open the project in Android Studio
2. Sync Gradle dependencies
3. Update the BASE_URL in `NetworkClient.kt` to point to your server
4. Build and run on device

## Permissions

The app requires the following permissions:
- CAMERA - For video recording
- RECORD_AUDIO - For audio recording
- ACCESS_FINE_LOCATION - For location metadata
- WRITE_EXTERNAL_STORAGE - For storing video files
- INTERNET - For uploading videos

## Architecture

### MainActivity
Main activity that handles permissions and UI interactions.

### VideoRecorder
Manages CameraX video recording, creating video files and metadata.

### NetworkClient
Retrofit/OkHttp client for API communication.

### UploadWorker
WorkManager worker for background video uploads with retry logic.

## Configuration

Update the server URL in `NetworkClient.kt`:
```kotlin
private const val BASE_URL = "https://YOUR_SERVER_URL"
```

## Usage

1. Grant permissions when prompted
2. Call `onStartRecordClick()` to start recording
3. Call `onStopRecordClick()` to stop recording
4. Video will be automatically uploaded in the background
