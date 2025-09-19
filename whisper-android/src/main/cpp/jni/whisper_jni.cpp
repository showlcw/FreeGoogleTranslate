#include <jni.h>
#include <string>
#include <vector>
#include <android/log.h>
#include "whisper.h"

#define LOG_TAG "WhisperJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static struct whisper_context* g_whisper_ctx = nullptr;

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_whisper_WhisperProcessor_loadModel(JNIEnv *env, jclass clazz, jstring model_path) {
    const char* path = env->GetStringUTFChars(model_path, nullptr);
    
    LOGI("Loading Whisper model from: %s", path);
    
    g_whisper_ctx = whisper_init_from_file(path);
    
    env->ReleaseStringUTFChars(model_path, path);
    
    if (g_whisper_ctx == nullptr) {
        LOGE("Failed to load Whisper model");
        return JNI_FALSE;
    }
    
    LOGI("Whisper model loaded successfully");
    return JNI_TRUE;
}

JNIEXPORT void JNICALL
Java_com_whisper_WhisperProcessor_freeModel(JNIEnv *env, jclass clazz) {
    if (g_whisper_ctx != nullptr) {
        whisper_free(g_whisper_ctx);
        g_whisper_ctx = nullptr;
        LOGI("Whisper model freed");
    }
}

JNIEXPORT jstring JNICALL
Java_com_whisper_WhisperProcessor_transcribeAudio(JNIEnv *env, jclass clazz, jfloatArray audio_data, jint sample_rate) {
    if (g_whisper_ctx == nullptr) {
        LOGE("Whisper model not loaded");
        return env->NewStringUTF("");
    }
    
    jsize length = env->GetArrayLength(audio_data);
    jfloat* audio = env->GetFloatArrayElements(audio_data, nullptr);
    
    if (audio == nullptr) {
        LOGE("Failed to get audio data");
        return env->NewStringUTF("");
    }
    
    // Prepare whisper parameters
    struct whisper_full_params params = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
    params.n_threads = 1;
    params.language = "auto";
    params.translate = false;
    params.print_progress = false;
    params.print_realtime = false;
    params.print_timestamps = false;
    
    // Run inference
    int result = whisper_full(g_whisper_ctx, params, audio, length);
    
    env->ReleaseFloatArrayElements(audio_data, audio, JNI_ABORT);
    
    if (result != 0) {
        LOGE("Whisper transcription failed with error: %d", result);
        return env->NewStringUTF("");
    }
    
    // Get transcribed text
    const int n_segments = whisper_full_n_segments(g_whisper_ctx);
    std::string text;
    
    for (int i = 0; i < n_segments; ++i) {
        const char* segment_text = whisper_full_get_segment_text(g_whisper_ctx, i);
        if (segment_text != nullptr) {
            text += segment_text;
        }
    }
    
    LOGI("Transcription completed: %s", text.c_str());
    return env->NewStringUTF(text.c_str());
}

JNIEXPORT jboolean JNICALL
Java_com_whisper_WhisperProcessor_isModelLoaded(JNIEnv *env, jclass clazz) {
    return g_whisper_ctx != nullptr ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jstring JNICALL
Java_com_whisper_WhisperProcessor_getVersion(JNIEnv *env, jclass clazz) {
    return env->NewStringUTF("Whisper.cpp v1.5.4 for Android");
}

}