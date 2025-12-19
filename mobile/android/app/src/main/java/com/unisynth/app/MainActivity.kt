package com.unisynth.app

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.core.app.ActivityCompat
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import com.google.android.gms.location.LocationServices
import java.io.File

class MainActivity : AppCompatActivity() {
    private val REQUEST_PERMS = 1001
    private val scope = MainScope()
    private lateinit var recorder: VideoRecorder
    private var projectId = "demo-project"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        recorder = VideoRecorder(this)
        requestPermissions()
    }

    private fun requestPermissions() {
        val perms = arrayOf(Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO, Manifest.permission.ACCESS_FINE_LOCATION)
        ActivityCompat.requestPermissions(this, perms, REQUEST_PERMS)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        if (requestCode == REQUEST_PERMS) {
            var allGranted = true
            for (r in grantResults) if (r != PackageManager.PERMISSION_GRANTED) allGranted = false
            if (allGranted) {
                scope.launch {
                    recorder.startCamera()
                }
            }
        }
    }

    // Call this to start/stop recording UI actions
    fun onStartRecordClick() {
        val outDir = File(cacheDir, "unisynth_uploads").apply { if (!exists()) mkdirs() }
        val client = LocationServices.getFusedLocationProviderClient(this)
        client.lastLocation.addOnSuccessListener { location: Location? ->
            recorder.startRecording(outDir, projectId, location)
        }
    }
    fun onStopRecordClick() {
        recorder.stopRecording()
    }
}
