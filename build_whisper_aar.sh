#!/bin/bash

# Script to set up Android SDK and build the Whisper AAR
set -e

echo "🔧 Setting up Android development environment..."

# Create Android SDK directory
export ANDROID_HOME="/home/runner/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

mkdir -p "$ANDROID_HOME"

# Download and install Android command line tools
echo "📥 Downloading Android command line tools..."
cd "$ANDROID_HOME"
wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip -q commandlinetools-linux-9477386_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rm -f commandlinetools-linux-9477386_latest.zip

# Accept licenses and install required packages
echo "📱 Installing Android SDK components..."
yes | cmdline-tools/latest/bin/sdkmanager --licenses >/dev/null 2>&1 || true
cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
cmdline-tools/latest/bin/sdkmanager "ndk;25.1.8937393" "cmake;3.22.1"

# Set environment variables for the build
export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/25.1.8937393"
export PATH="$PATH:$ANDROID_NDK_HOME"

echo "✅ Android SDK setup complete!"
echo "🏗️ Building Whisper AAR..."

# Navigate to project directory and build
cd /home/runner/work/FreeGoogleTranslate/FreeGoogleTranslate

# Build the AAR
./gradlew :whisper-android:assembleRelease

echo "🎉 Build complete! AAR file location:"
find . -name "*.aar" -type f 2>/dev/null || echo "No AAR files found. Check build logs above."

echo ""
echo "📋 Build Summary:"
echo "- Project: Whisper.cpp Android Integration"
echo "- Output: whisper-android/build/outputs/aar/"
echo "- Model support: tiny, base, small"
echo "- Target API: 34 (Android 14)"
echo "- Min API: 21 (Android 5.0)"
echo "- ABIs: arm64-v8a, armeabi-v7a, x86, x86_64"