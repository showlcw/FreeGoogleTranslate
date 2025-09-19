# Whisper.cpp Android AAR - Quick Start Guide

## 📱 项目概述 (Project Overview)

本项目将 Whisper.cpp 集成到 Android 中，提供实时语音识别功能，编译成 AAR 库供 Android 开发者使用。

This project integrates Whisper.cpp into Android for real-time speech recognition, compiled as an AAR library for Android developers.

## ✨ 主要功能 (Key Features)

- 🎤 **实时语音识别** - Real-time speech recognition
- 🌍 **多语言支持** - Multi-language support  
- 📦 **简单集成** - Easy integration as AAR
- ⚡ **高性能** - Optimized JNI bridge
- 🔄 **后台处理** - Background audio processing
- 📱 **Android 原生** - Native Android implementation

## 🛠️ 编译 AAR (Building the AAR)

### 环境要求 (Requirements)
- Android SDK + NDK
- CMake 3.22.1+
- Gradle 8.0+

### 编译步骤 (Build Steps)

1. **克隆项目 (Clone project):**
   ```bash
   git clone <this-repository>
   cd FreeGoogleTranslate
   ```

2. **自动编译 (Auto build):**
   ```bash
   ./build_whisper_aar.sh
   ```

3. **手动编译 (Manual build):**
   ```bash
   # 安装 Android SDK/NDK (Install Android SDK/NDK)
   ./gradlew :whisper-android:assembleRelease
   ```

4. **获取 AAR (Get AAR):**
   ```
   whisper-android/build/outputs/aar/whisper-android-release.aar
   ```

## 📲 使用方法 (Usage)

### 1. 集成 AAR (Integrate AAR)

在你的 Android 项目中添加 AAR (Add AAR to your Android project):

```gradle
dependencies {
    implementation files('libs/whisper-android-release.aar')
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
}
```

### 2. 添加权限 (Add Permissions)

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

### 3. 代码示例 (Code Example)

```kotlin
import com.whisper.*

class MainActivity : AppCompatActivity() {
    private lateinit var whisperService: WhisperRealtimeService
    private lateinit var modelManager: WhisperModelManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 初始化 (Initialize)
        modelManager = WhisperModelManager(this)
        whisperService = WhisperRealtimeService(this)
        
        // 设置回调 (Setup callbacks)
        whisperService.onTranscriptionResult = { text ->
            println("识别结果: $text")  // Recognition result
        }
        
        whisperService.onError = { error ->
            println("错误: $error")     // Error
        }
        
        // 下载并加载模型 (Download and load model)
        lifecycleScope.launch {
            // 下载 tiny 模型 (Download tiny model - fastest)
            val result = modelManager.downloadModel("tiny") { progress ->
                println("下载进度: ${progress.percentage}%")
            }
            
            result.onSuccess { modelPath ->
                if (WhisperProcessor.loadModel(modelPath)) {
                    // 开始录音识别 (Start recording)
                    whisperService.startRecording()
                    println("开始语音识别...")
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

## 🔧 API 参考 (API Reference)

### WhisperProcessor (核心处理器)
```kotlin
// 加载模型 (Load model)
WhisperProcessor.loadModel(modelPath: String): Boolean

// 释放模型 (Free model)  
WhisperProcessor.freeModel()

// 转录音频 (Transcribe audio)
WhisperProcessor.transcribeAudio(audioData: FloatArray, sampleRate: Int): String

// 检查模型状态 (Check model status)
WhisperProcessor.isModelLoaded(): Boolean
```

### WhisperRealtimeService (实时服务)
```kotlin
// 开始录音 (Start recording)
whisperService.startRecording()

// 停止录音 (Stop recording)
whisperService.stopRecording()

// 回调设置 (Callbacks)
whisperService.onTranscriptionResult = { text -> }
whisperService.onError = { error -> }
```

### WhisperModelManager (模型管理)
```kotlin
// 下载模型 (Download model)
modelManager.downloadModel("tiny|base|small") { progress -> }

// 检查模型 (Check model)
modelManager.isModelDownloaded("tiny"): Boolean

// 获取路径 (Get path)
modelManager.getModelPath("tiny"): String?
```

## 🎯 模型选择 (Model Selection)

| 模型 Model | 大小 Size | 速度 Speed | 精度 Accuracy | 推荐用途 Recommended Use |
|------------|-----------|------------|---------------|-------------------------|
| **tiny**   | 39MB      | 最快 Fastest | 一般 Fair | 实时应用 Real-time apps |
| **base**   | 142MB     | 中等 Medium  | 好 Good   | 平衡方案 Balanced |
| **small**  | 466MB     | 慢 Slow      | 很好 Great | 高精度需求 High accuracy |

💡 **建议**: 实时语音识别推荐使用 **tiny** 模型
💡 **Tip**: Use **tiny** model for real-time speech recognition

## 🔍 故障排除 (Troubleshooting)

### 常见问题 (Common Issues)

1. **模型加载失败 (Model loading fails)**
   - 检查模型文件完整性 (Check model file integrity)
   - 确保有足够存储空间 (Ensure enough storage)

2. **录音权限被拒 (Recording permission denied)**
   - 运行时请求 RECORD_AUDIO 权限 (Request RECORD_AUDIO permission at runtime)

3. **内存不足 (Out of memory)**
   - 使用更小的模型 (Use smaller model)
   - 增加堆内存大小 (Increase heap size)

4. **没有识别输出 (No transcription output)**
   - 检查麦克风输入 (Check microphone input)
   - 确认模型加载成功 (Confirm model loaded)

### 调试日志 (Debug Logs)
```bash
adb shell setprop log.tag.WhisperJNI VERBOSE
adb logcat -s WhisperJNI
```

## 📊 性能数据 (Performance Data)

- **音频格式**: 16kHz, 单声道, 16位 PCM
- **支持架构**: arm64-v8a, armeabi-v7a, x86, x86_64  
- **最低版本**: Android 5.0 (API 21)
- **目标版本**: Android 14 (API 34)

## 💡 使用建议 (Usage Tips)

1. **首次使用**: 建议先下载 tiny 模型测试
2. **网络环境**: 模型下载需要网络连接
3. **权限处理**: 记得在运行时请求麦克风权限
4. **资源管理**: 使用完毕后调用 cleanup() 释放资源
5. **多语言**: Whisper 支持多种语言自动识别

## 📞 技术支持 (Support)

如果你在使用过程中遇到问题，可以：
- 查看项目 README.md
- 检查 Android Studio 构建日志
- 确认 NDK 和 CMake 版本
- 查看 Whisper.cpp 官方文档

If you encounter issues:
- Check project README.md
- Review Android Studio build logs  
- Verify NDK and CMake versions
- Refer to official Whisper.cpp documentation

---

**🎉 现在你可以在 Android 应用中使用 Whisper.cpp 进行实时语音识别了！**

**🎉 Now you can use Whisper.cpp for real-time speech recognition in your Android apps!**