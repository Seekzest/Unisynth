package com.unisynth.app

import android.content.Context
import androidx.work.*
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.util.concurrent.TimeUnit

class UploadWorker(appContext: Context, workerParams: WorkerParameters) :
    CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val filePath = inputData.getString("filePath") ?: return Result.failure()
        val metadata = inputData.getString("metadata") ?: "{}"
        val file = File(filePath)
        val part = NetworkClient.multipartFromFile("video", file)
        val mdBody: RequestBody = metadata.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val call = NetworkClient.service.uploadSegment(part, mdBody)
        return try {
            val resp = call.execute()
            if (resp.isSuccessful) {
                file.delete()
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        fun enqueueUpload(context: Context, file: File, metadata: String) {
            val data = workDataOf(
                "filePath" to file.absolutePath,
                "metadata" to metadata
            )
            val req = OneTimeWorkRequestBuilder<UploadWorker>()
                .setInputData(data)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueue(req)
        }
    }
}
