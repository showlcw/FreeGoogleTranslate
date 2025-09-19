package com.freegoogletranslate

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.whisper.WhisperModelManager
import com.whisper.WhisperProcessor
import com.whisper.WhisperRealtimeService
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    
    private lateinit var whisperService: WhisperRealtimeService
    private lateinit var modelManager: WhisperModelManager
    private var isRecording = false
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            initializeWhisper()
        } else {
            Toast.makeText(this, "Microphone permission is required", Toast.LENGTH_LONG).show()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        modelManager = WhisperModelManager(this)
        whisperService = WhisperRealtimeService(this)
        
        setupWhisperCallbacks()
        checkPermissions()
    }
    
    private fun checkPermissions() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED -> {
                initializeWhisper()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }
    
    private fun initializeWhisper() {
        lifecycleScope.launch {
            try {
                // Check if we have a model downloaded
                if (!modelManager.isModelDownloaded("tiny")) {
                    Toast.makeText(this@MainActivity, "Downloading Whisper model...", Toast.LENGTH_SHORT).show()
                    
                    val result = modelManager.downloadModel("tiny") { progress ->
                        runOnUiThread {
                            // Update progress UI here
                            Toast.makeText(
                                this@MainActivity, 
                                "Downloading: ${progress.percentage}%", 
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                    
                    result.fold(
                        onSuccess = { modelPath ->
                            loadModel(modelPath)
                        },
                        onFailure = { error ->
                            Toast.makeText(
                                this@MainActivity, 
                                "Failed to download model: ${error.message}", 
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    )
                } else {
                    val modelPath = modelManager.getModelPath("tiny")!!
                    loadModel(modelPath)
                }
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun loadModel(modelPath: String) {
        val success = WhisperProcessor.loadModel(modelPath)
        if (success) {
            Toast.makeText(this, "Whisper model loaded successfully!", Toast.LENGTH_SHORT).show()
            // You can now start recording
            startRecording()
        } else {
            Toast.makeText(this, "Failed to load Whisper model", Toast.LENGTH_LONG).show()
        }
    }
    
    private fun setupWhisperCallbacks() {
        whisperService.onTranscriptionResult = { text ->
            runOnUiThread {
                // Update UI with transcribed text
                Toast.makeText(this, "Transcribed: $text", Toast.LENGTH_SHORT).show()
                // You can update a TextView or send to translation service here
            }
        }
        
        whisperService.onError = { error ->
            runOnUiThread {
                Toast.makeText(this, "Error: $error", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun startRecording() {
        if (!isRecording) {
            whisperService.startRecording()
            isRecording = true
            Toast.makeText(this, "Started recording...", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun stopRecording() {
        if (isRecording) {
            whisperService.stopRecording()
            isRecording = false
            Toast.makeText(this, "Stopped recording", Toast.LENGTH_SHORT).show()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        whisperService.cleanup()
        WhisperProcessor.freeModel()
    }
}