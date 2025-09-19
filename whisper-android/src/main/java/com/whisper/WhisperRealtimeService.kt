package com.whisper

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.core.app.ActivityCompat
import kotlinx.coroutines.*
import kotlin.math.abs

/**
 * Real-time speech recognition service using Whisper.cpp
 */
class WhisperRealtimeService(private val context: Context) {
    
    companion object {
        private const val SAMPLE_RATE = 16000
        private const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        private const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        private const val BUFFER_SIZE_FACTOR = 2
        private const val SILENCE_THRESHOLD = 500
        private const val MIN_RECORDING_DURATION = 1000 // 1 second
    }
    
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var recordingJob: Job? = null
    private val bufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT) * BUFFER_SIZE_FACTOR
    
    var onTranscriptionResult: ((String) -> Unit)? = null
    var onError: ((String) -> Unit)? = null
    
    /**
     * Check if microphone permission is granted
     */
    fun hasPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Start real-time speech recognition
     */
    fun startRecording() {
        if (!hasPermission()) {
            onError?.invoke("Microphone permission not granted")
            return
        }
        
        if (!WhisperProcessor.isModelLoaded()) {
            onError?.invoke("Whisper model not loaded")
            return
        }
        
        if (isRecording) {
            return
        }
        
        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )
            
            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                onError?.invoke("Failed to initialize AudioRecord")
                return
            }
            
            isRecording = true
            audioRecord?.startRecording()
            
            recordingJob = CoroutineScope(Dispatchers.IO).launch {
                processAudio()
            }
            
        } catch (e: Exception) {
            onError?.invoke("Error starting recording: ${e.message}")
        }
    }
    
    /**
     * Stop speech recognition
     */
    fun stopRecording() {
        isRecording = false
        recordingJob?.cancel()
        
        audioRecord?.apply {
            stop()
            release()
        }
        audioRecord = null
    }
    
    private suspend fun processAudio() {
        val buffer = ShortArray(bufferSize)
        val audioBuffer = mutableListOf<Float>()
        var silenceCounter = 0
        
        while (isRecording) {
            val readResult = audioRecord?.read(buffer, 0, buffer.size) ?: 0
            
            if (readResult > 0) {
                // Convert to float and normalize
                val floatBuffer = buffer.take(readResult).map { it / 32768.0f }
                audioBuffer.addAll(floatBuffer)
                
                // Check for silence
                val amplitude = floatBuffer.maxOfOrNull { abs(it) } ?: 0f
                if (amplitude < SILENCE_THRESHOLD / 32768.0f) {
                    silenceCounter++
                } else {
                    silenceCounter = 0
                }
                
                // Process audio when we have enough data and detect silence or buffer is full
                val shouldProcess = (silenceCounter > 50 && audioBuffer.size > SAMPLE_RATE) ||  // 50 * 20ms = 1s silence
                                  audioBuffer.size > SAMPLE_RATE * 10 // Max 10 seconds
                
                if (shouldProcess && audioBuffer.size > SAMPLE_RATE * MIN_RECORDING_DURATION / 1000) {
                    val audioData = audioBuffer.toFloatArray()
                    audioBuffer.clear()
                    silenceCounter = 0
                    
                    // Transcribe on background thread
                    withContext(Dispatchers.Default) {
                        try {
                            val result = WhisperProcessor.transcribeAudio(audioData, SAMPLE_RATE)
                            if (result.isNotBlank()) {
                                withContext(Dispatchers.Main) {
                                    onTranscriptionResult?.invoke(result.trim())
                                }
                            }
                        } catch (e: Exception) {
                            withContext(Dispatchers.Main) {
                                onError?.invoke("Transcription error: ${e.message}")
                            }
                        }
                    }
                }
            }
            
            delay(20) // 20ms delay
        }
    }
    
    /**
     * Clean up resources
     */
    fun cleanup() {
        stopRecording()
    }
}