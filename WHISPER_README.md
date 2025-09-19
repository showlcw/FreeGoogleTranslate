# Whisper.cpp Android Integration

This project integrates [whisper.cpp](https://github.com/ggerganov/whisper.cpp) for real-time speech recognition in Android applications. It provides an easy-to-use AAR (Android Archive) library that can be integrated into any Android project.

## Features

- ✅ Real-time speech recognition using Whisper.cpp
- ✅ Multiple model sizes (tiny, base, small)
- ✅ Automatic model downloading
- ✅ Background audio processing
- ✅ Easy integration as AAR library
- ✅ JNI bridge for optimal performance
- ✅ Support for multiple languages

## Project Structure

```
├── app/                          # Demo Android application
├── whisper-android/              # Whisper AAR library module
│   ├── src/main/
│   │   ├── cpp/
│   │   │   ├── whisper.cpp/      # Whisper.cpp submodule
│   │   │   ├── jni/              # JNI wrapper code
│   │   │   └── CMakeLists.txt    # CMake build configuration
│   │   ├── java/com/whisper/     # Kotlin/Java API
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle                  # Root build configuration
└── settings.gradle
```

## Building the AAR

### Prerequisites

- Android SDK with NDK installed
- CMake 3.22.1 or later
- Gradle 8.0+
- Android Studio or command line tools

### Build Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd FreeGoogleTranslate
   ```

2. **Build the AAR:**
   ```bash
   ./gradlew :whisper-android:assembleRelease
   ```

3. **Find the AAR:**
   The compiled AAR will be located at:
   ```
   whisper-android/build/outputs/aar/whisper-android-release.aar
   ```

## Using the AAR in Your Project

### 1. Add the AAR to your project

Copy the `whisper-android-release.aar` to your project's `libs` folder and add to your `build.gradle`:

```gradle
dependencies {
    implementation files('libs/whisper-android-release.aar')
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

### 2. Add permissions to AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

### 3. Initialize and use the library

```kotlin
import com.whisper.WhisperProcessor
import com.whisper.WhisperModelManager
import com.whisper.WhisperRealtimeService

class MainActivity : AppCompatActivity() {
    private lateinit var whisperService: WhisperRealtimeService
    private lateinit var modelManager: WhisperModelManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        modelManager = WhisperModelManager(this)
        whisperService = WhisperRealtimeService(this)
        
        // Set up callbacks
        whisperService.onTranscriptionResult = { text ->
            // Handle transcribed text
            println("Transcribed: $text")
        }
        
        whisperService.onError = { error ->
            // Handle errors
            println("Error: $error")
        }
        
        // Download and load model
        lifecycleScope.launch {
            val result = modelManager.downloadModel("tiny") { progress ->
                // Update progress UI
                println("Download progress: ${progress.percentage}%")
            }
            
            result.onSuccess { modelPath ->
                if (WhisperProcessor.loadModel(modelPath)) {
                    // Start recording
                    whisperService.startRecording()
                }
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        whisperService.cleanup()
        WhisperProcessor.freeModel()
    }
}
```

## API Reference

### WhisperProcessor

Core processor for Whisper operations:

- `loadModel(modelPath: String): Boolean` - Load a Whisper model
- `freeModel()` - Free the loaded model
- `transcribeAudio(audioData: FloatArray, sampleRate: Int): String` - Transcribe audio
- `isModelLoaded(): Boolean` - Check if model is loaded
- `getVersion(): String` - Get library version

### WhisperRealtimeService

Real-time speech recognition service:

- `startRecording()` - Start real-time recording and transcription
- `stopRecording()` - Stop recording
- `hasPermission(): Boolean` - Check microphone permission
- `cleanup()` - Clean up resources

Callbacks:
- `onTranscriptionResult: ((String) -> Unit)?` - Called with transcribed text
- `onError: ((String) -> Unit)?` - Called on errors

### WhisperModelManager

Model download and management:

- `downloadModel(modelName: String, onProgress: ((DownloadProgress) -> Unit)? = null): Result<String>` - Download a model
- `isModelDownloaded(modelName: String): Boolean` - Check if model exists
- `getModelPath(modelName: String): String?` - Get local model path
- `deleteModel(modelName: String): Boolean` - Delete a model
- `clearAllModels(): Boolean` - Clear all models

Available models: "tiny", "base", "small"

## Performance Notes

- **Tiny model**: ~39MB, fastest inference, lower accuracy
- **Base model**: ~142MB, good balance of speed and accuracy
- **Small model**: ~466MB, better accuracy, slower inference

For real-time applications, the "tiny" model is recommended for optimal performance.

## Technical Details

- **Audio Format**: 16kHz, mono, 16-bit PCM
- **Supported ABIs**: arm64-v8a, armeabi-v7a, x86, x86_64
- **Minimum Android API**: 21 (Android 5.0)
- **Target Android API**: 34 (Android 14)

## Troubleshooting

### Common Issues

1. **Model loading fails**: Ensure the model file is complete and not corrupted
2. **Recording permission denied**: Request RECORD_AUDIO permission at runtime
3. **Out of memory**: Use smaller models or increase heap size
4. **No transcription output**: Check microphone input and model loading

### Debug Logs

Enable debug logging to see Whisper.cpp output:
```bash
adb shell setprop log.tag.WhisperJNI VERBOSE
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

Whisper.cpp is licensed under the MIT License by Georgi Gerganov and contributors.

## Acknowledgments

- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) by Georgi Gerganov
- [OpenAI Whisper](https://github.com/openai/whisper) for the original model