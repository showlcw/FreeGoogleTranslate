cmake_minimum_required(VERSION 3.22.1)

project("whisper-android")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set Android specific flags
set(CMAKE_ANDROID_ARCH_ABI ${ANDROID_ABI})

# Include whisper.cpp subdirectory
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/whisper.cpp ${CMAKE_CURRENT_BINARY_DIR}/whisper.cpp)

# Add JNI source
set(JNI_SOURCES
    ${CMAKE_CURRENT_SOURCE_DIR}/jni/whisper_jni.cpp
)

# Create the shared library
add_library(
    whisper-android
    SHARED
    ${JNI_SOURCES}
)

# Include directories
target_include_directories(whisper-android PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/whisper.cpp/include
    ${CMAKE_CURRENT_SOURCE_DIR}/jni
)

# Link with whisper library
target_link_libraries(whisper-android
    whisper
)

# Find and link Android libraries
find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(
    whisper-android
    ${log-lib}
    ${android-lib}
)