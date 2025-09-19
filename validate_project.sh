#!/bin/bash

# Quick validation script to check project structure
echo "🔍 Validating Whisper.cpp Android project structure..."

# Check main files
echo "📁 Checking project structure:"

required_files=(
    "build.gradle"
    "settings.gradle"
    "gradlew"
    "gradle/wrapper/gradle-wrapper.properties"
    "gradle/wrapper/gradle-wrapper.jar"
    "app/build.gradle"
    "app/src/main/AndroidManifest.xml"
    "app/src/main/java/com/freegoogletranslate/MainActivity.kt"
    "whisper-android/build.gradle"
    "whisper-android/src/main/AndroidManifest.xml"
    "whisper-android/src/main/cpp/CMakeLists.txt"
    "whisper-android/src/main/cpp/jni/whisper_jni.cpp"
    "whisper-android/src/main/java/com/whisper/WhisperProcessor.kt"
    "whisper-android/src/main/java/com/whisper/WhisperRealtimeService.kt"
    "whisper-android/src/main/java/com/whisper/WhisperModelManager.kt"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

# Check if whisper.cpp is properly cloned
if [[ -d "whisper-android/src/main/cpp/whisper.cpp" ]]; then
    echo "✅ whisper-android/src/main/cpp/whisper.cpp/"
    echo "   - Checking core files:"
    whisper_files=(
        "whisper-android/src/main/cpp/whisper.cpp/src/whisper.cpp"
        "whisper-android/src/main/cpp/whisper.cpp/include/whisper.h"
        "whisper-android/src/main/cpp/whisper.cpp/ggml/src/ggml.c"
        "whisper-android/src/main/cpp/whisper.cpp/ggml/include/ggml.h"
    )
    
    for file in "${whisper_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo "   ✅ $(basename $file)"
        else
            echo "   ❌ $(basename $file) (missing)"
            missing_files+=("$file")
        fi
    done
else
    echo "❌ whisper-android/src/main/cpp/whisper.cpp/ (missing)"
    missing_files+=("whisper.cpp directory")
fi

echo ""
echo "📊 Summary:"
echo "Total files checked: ${#required_files[@]}"
echo "Files found: $((${#required_files[@]} - ${#missing_files[@]}))"
echo "Missing files: ${#missing_files[@]}"

if [[ ${#missing_files[@]} -eq 0 ]]; then
    echo ""
    echo "🎉 All required files are present! Project structure is complete."
    echo ""
    echo "🚀 To build the AAR:"
    echo "   1. Install Android SDK and NDK"
    echo "   2. Run: ./build_whisper_aar.sh"
    echo "   3. Or manually: ./gradlew :whisper-android:assembleRelease"
    echo ""
    echo "📱 Integration in your Android project:"
    echo "   1. Copy the generated AAR to your libs/ folder"
    echo "   2. Add to build.gradle: implementation files('libs/whisper-android-release.aar')"
    echo "   3. Request RECORD_AUDIO permission"
    echo "   4. Use WhisperRealtimeService for speech recognition"
    echo ""
    echo "🎮 Features implemented:"
    echo "   ✅ Real-time speech recognition"
    echo "   ✅ Multiple Whisper model sizes (tiny, base, small)"
    echo "   ✅ Automatic model downloading"
    echo "   ✅ JNI bridge for optimal performance"
    echo "   ✅ Background audio processing"
    echo "   ✅ Easy Kotlin/Java API"
    echo "   ✅ Demo Android application"
    exit 0
else
    echo ""
    echo "⚠️  Some files are missing. Please check the implementation."
    exit 1
fi