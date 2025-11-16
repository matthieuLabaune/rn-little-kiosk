package com.rnparryhotterkiosk

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import java.io.File

class VideoScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "VideoScanner"
    }

    @ReactMethod
    fun scanVideos(folderPath: String, promise: Promise) {
        try {
            val folder = File(folderPath)

            if (!folder.exists()) {
                promise.reject("FOLDER_NOT_FOUND", "Le dossier n'existe pas: $folderPath")
                return
            }

            if (!folder.isDirectory) {
                promise.reject("NOT_A_FOLDER", "Le chemin n'est pas un dossier: $folderPath")
                return
            }

            val videoFiles = folder.listFiles { file ->
                file.isFile && file.extension.lowercase() in listOf("mp4", "mov", "avi", "mkv", "webm")
            }

            val result = WritableNativeArray()

            videoFiles?.sortedBy { it.name }?.forEach { file ->
                val videoInfo = WritableNativeMap()
                videoInfo.putString("name", file.name)
                videoInfo.putString("path", file.absolutePath)
                videoInfo.putString("uri", "file://${file.absolutePath}")
                videoInfo.putDouble("size", file.length().toDouble())
                result.pushMap(videoInfo)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", "Erreur lors du scan: ${e.message}")
        }
    }

    @ReactMethod
    fun getDefaultVideoFolder(promise: Promise) {
        try {
            val folder = File(reactApplicationContext.filesDir, "videos")
            promise.resolve(folder.absolutePath)
        } catch (e: Exception) {
            promise.reject("ERROR", "Erreur: ${e.message}")
        }
    }

    @ReactMethod
    fun createVideoFolder(promise: Promise) {
        try {
            val folder = File(reactApplicationContext.filesDir, "videos")
            if (!folder.exists()) {
                folder.mkdirs()
            }
            promise.resolve(folder.absolutePath)
        } catch (e: Exception) {
            promise.reject("ERROR", "Erreur création dossier: ${e.message}")
        }
    }
}
