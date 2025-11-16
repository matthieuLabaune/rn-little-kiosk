package com.rnparryhotterkiosk

import android.content.ContentResolver
import android.net.Uri
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class FileImporterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "FileImporter"
    }

    @ReactMethod
    fun importVideoFromUri(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val contentResolver: ContentResolver = reactApplicationContext.contentResolver

            // Lire le fichier depuis l'URI
            val inputStream: InputStream? = contentResolver.openInputStream(uri)

            if (inputStream == null) {
                promise.reject("ERROR", "Impossible d'ouvrir le fichier")
                return
            }

            // Créer le dossier vidéos s'il n'existe pas
            val videosDir = File(reactApplicationContext.filesDir, "videos")
            if (!videosDir.exists()) {
                videosDir.mkdirs()
            }

            // Générer un nom de fichier
            val fileName = "portrait${System.currentTimeMillis()}.mp4"
            val outputFile = File(videosDir, fileName)

            // Copier le fichier
            val outputStream = FileOutputStream(outputFile)
            val buffer = ByteArray(8192)
            var length: Int

            while (inputStream.read(buffer).also { length = it } > 0) {
                outputStream.write(buffer, 0, length)
            }

            outputStream.close()
            inputStream.close()

            promise.resolve(outputFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun importAllVideosFromDownload(promise: Promise) {
        try {
            // Scanner le dossier Download
            val downloadDir = File("/sdcard/Download")
            val videosDir = File(reactApplicationContext.filesDir, "videos")

            if (!videosDir.exists()) {
                videosDir.mkdirs()
            }

            val videoFiles = downloadDir.listFiles { file ->
                file.extension.lowercase() in listOf("mp4", "mov", "avi", "mkv", "webm")
            }

            if (videoFiles == null || videoFiles.isEmpty()) {
                promise.resolve("Aucune vidéo trouvée dans Download")
                return
            }

            var copied = 0
            videoFiles.forEach { sourceFile ->
                try {
                    val destFile = File(videosDir, sourceFile.name)
                    sourceFile.copyTo(destFile, overwrite = true)
                    copied++
                } catch (e: Exception) {
                    // Ignore les erreurs individuelles
                }
            }

            promise.resolve("$copied vidéo(s) importée(s)")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
