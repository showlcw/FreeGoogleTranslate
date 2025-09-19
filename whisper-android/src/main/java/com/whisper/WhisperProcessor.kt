package com.whisper

/**
 * Core Whisper processor for real-time speech recognition
 */
object WhisperProcessor {
    
    init {
        System.loadLibrary("whisper-android")
    }
    
    /**
     * Load a Whisper model from file path
     * @param modelPath Path to the .bin model file
     * @return true if model loaded successfully, false otherwise
     */
    external fun loadModel(modelPath: String): Boolean
    
    /**
     * Free the loaded model and release memory
     */
    external fun freeModel()
    
    /**
     * Transcribe audio data using the loaded model
     * @param audioData Float array containing audio samples (16kHz, mono)
     * @param sampleRate Sample rate of the audio (should be 16000)
     * @return Transcribed text string
     */
    external fun transcribeAudio(audioData: FloatArray, sampleRate: Int): String
    
    /**
     * Check if a model is currently loaded
     * @return true if model is loaded, false otherwise
     */
    external fun isModelLoaded(): Boolean
    
    /**
     * Get the version of the Whisper library
     * @return Version string
     */
    external fun getVersion(): String
}