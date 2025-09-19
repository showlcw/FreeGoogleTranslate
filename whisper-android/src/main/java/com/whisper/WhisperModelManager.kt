package com.whisper

import android.content.Context
import kotlinx.coroutines.*
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * Model manager for downloading and managing Whisper models
 */
class WhisperModelManager(private val context: Context) {
    
    companion object {
        // Available models with their URLs and sizes
        val AVAILABLE_MODELS = mapOf(
            "tiny" to ModelInfo(
                "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
                "ggml-tiny.bin",
                39 * 1024 * 1024 // 39MB
            ),
            "base" to ModelInfo(
                "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
                "ggml-base.bin",
                142 * 1024 * 1024 // 142MB
            ),
            "small" to ModelInfo(
                "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
                "ggml-small.bin",
                466 * 1024 * 1024 // 466MB
            )
        )
    }
    
    data class ModelInfo(
        val url: String,
        val filename: String,
        val size: Long
    )
    
    data class DownloadProgress(
        val downloaded: Long,
        val total: Long,
        val percentage: Int
    )
    
    private val modelsDir = File(context.filesDir, "whisper_models")
    
    init {
        if (!modelsDir.exists()) {
            modelsDir.mkdirs()
        }
    }
    
    /**
     * Check if a model exists locally
     */
    fun isModelDownloaded(modelName: String): Boolean {
        val modelInfo = AVAILABLE_MODELS[modelName] ?: return false
        val modelFile = File(modelsDir, modelInfo.filename)
        return modelFile.exists() && modelFile.length() > 0
    }
    
    /**
     * Get the local path of a model
     */
    fun getModelPath(modelName: String): String? {
        val modelInfo = AVAILABLE_MODELS[modelName] ?: return null
        val modelFile = File(modelsDir, modelInfo.filename)
        return if (modelFile.exists()) modelFile.absolutePath else null
    }
    
    /**
     * Download a model with progress callback
     */
    suspend fun downloadModel(
        modelName: String,
        onProgress: ((DownloadProgress) -> Unit)? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val modelInfo = AVAILABLE_MODELS[modelName] 
                ?: return@withContext Result.failure(IllegalArgumentException("Unknown model: $modelName"))
            
            val modelFile = File(modelsDir, modelInfo.filename)
            
            // If model already exists and has correct size, return it
            if (modelFile.exists() && modelFile.length() == modelInfo.size) {
                return@withContext Result.success(modelFile.absolutePath)
            }
            
            val url = URL(modelInfo.url)
            val connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 10000
            connection.readTimeout = 30000
            
            val totalSize = connection.contentLength.toLong()
            val inputStream: InputStream = connection.inputStream
            val outputStream = FileOutputStream(modelFile)
            
            val buffer = ByteArray(8192)
            var downloadedSize = 0L
            var bytesRead: Int
            
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                downloadedSize += bytesRead
                
                val percentage = ((downloadedSize * 100) / totalSize).toInt()
                onProgress?.invoke(DownloadProgress(downloadedSize, totalSize, percentage))
            }
            
            outputStream.close()
            inputStream.close()
            connection.disconnect()
            
            Result.success(modelFile.absolutePath)
            
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Delete a downloaded model
     */
    fun deleteModel(modelName: String): Boolean {
        val modelInfo = AVAILABLE_MODELS[modelName] ?: return false
        val modelFile = File(modelsDir, modelInfo.filename)
        return if (modelFile.exists()) modelFile.delete() else true
    }
    
    /**
     * Get size of downloaded models in bytes
     */
    fun getDownloadedModelsSize(): Long {
        return modelsDir.listFiles()?.sumOf { it.length() } ?: 0L
    }
    
    /**
     * Clear all downloaded models
     */
    fun clearAllModels(): Boolean {
        return try {
            modelsDir.listFiles()?.forEach { it.delete() }
            true
        } catch (e: Exception) {
            false
        }
    }
}