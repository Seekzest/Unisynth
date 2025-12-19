package com.unisynth.app

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.Call
import java.io.File
import java.util.concurrent.TimeUnit

interface ApiService {
    @Multipart
    @POST("/upload")
    fun uploadSegment(
        @Part video: MultipartBody.Part,
        @Part("metadata") metadata: RequestBody
    ): Call<Void>
}

object NetworkClient {
    // TODO: update to your server
    private const val BASE_URL = "https://YOUR_SERVER_URL"

    private val retrofit: Retrofit by lazy {
        val logging = HttpLoggingInterceptor()
        logging.setLevel(HttpLoggingInterceptor.Level.BODY)
        val client = OkHttpClient.Builder()
            .callTimeout(5, TimeUnit.MINUTES)
            .addInterceptor(logging)
            .build()

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(retrofit2.converter.gson.GsonConverterFactory.create())
            .build()
    }

    val service: ApiService by lazy { retrofit.create(ApiService::class.java) }

    fun multipartFromFile(fieldName: String, file: File): MultipartBody.Part {
        val reqFile = file.asRequestBody("video/mp4".toMediaTypeOrNull())
        return MultipartBody.Part.createFormData(fieldName, file.name, reqFile)
    }
}
