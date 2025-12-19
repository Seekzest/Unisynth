package com.unisynth.app

import android.content.Context
import android.location.Location
import androidx.camera.video.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class VideoRecorder(private val context: Context) {
    private var currentRecording: Recording? = null
    private lateinit var videoCapture: VideoCapture<Recorder>

    suspend fun startCamera() {
        withContext(Dispatchers.Main) {
            val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
            val cameraProvider = cameraProviderFuture.get()
            val recorder = Recorder.Builder()
                .setQualitySelector(QualitySelector.from(Quality.HD))
                .build()
            videoCapture = VideoCapture.withOutput(recorder)

            val cameraSelector = androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA
            cameraProvider.unbindAll()
            cameraProvider.bindToLifecycle(
                context as androidx.lifecycle.LifecycleOwner,
                cameraSelector,
                videoCapture
            )
        }
    }

    fun startRecording(outDir: File, projectId: String, location: Location?) {
        val file = createFile(outDir)
        val mediaStoreOutput = FileOutputOptions.Builder(file).build()
        currentRecording = videoCapture.output
            .prepareRecording(context, mediaStoreOutput)
            .apply { if (android.os.Build.VERSION.SDK_INT >= 31) withAudioEnabled() }
            .start(ContextCompat.getMainExecutor(context)) { recordEvent ->
                when (recordEvent) {
                    is VideoRecordEvent.Start -> {
                        // timestamp
                    }
                    is VideoRecordEvent.Finalize -> {
                        if (!recordEvent.hasError()) {
                            // upload file + metadata
                            val metadata = buildMetadata(projectId, location, file)
                            UploadWorker.enqueueUpload(context, file, metadata)
                        } else {
                            // error handling
                        }
                    }
                }
            }
    }

    fun stopRecording() {
        currentRecording?.stop()
        currentRecording = null
    }

    private fun createFile(baseFolder: File): File {
        val sdf = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US)
        val name = "unisynth_${sdf.format(Date())}.mp4"
        return File(baseFolder, name)
    }

    private fun buildMetadata(projectId: String, location: Location?, file: File): String {
        val locJson = if (location != null) {
            """{"lat":${location.latitude},"lng":${location.longitude},"alt":${location.altitude},"acc":${location.accuracy}}"""
        } else "null"
        val device = android.os.Build.MODEL ?: "unknown"
        val cameraModel = "CameraX" // add actual camera info if needed
        val ts = System.currentTimeMillis()
        val md = """{"projectId":"$projectId","timestamp":$ts,"device":"$device","camera":"$cameraModel","location":$locJson,"filename":"${file.name}"}"""
        return md
    }
}
