# Add any ProGuard configurations specific to the AAR library
-keep class com.whisper.** { *; }
-keepclassmembers class com.whisper.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep Whisper processor methods
-keep class com.whisper.WhisperProcessor {
    public static <methods>;
}