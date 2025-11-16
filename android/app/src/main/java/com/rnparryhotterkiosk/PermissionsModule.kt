package com.rnparryhotterkiosk

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Environment
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class PermissionsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "PermissionsModule"
    }

    @ReactMethod
    fun requestStoragePermissions(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                // Android 11+
                if (Environment.isExternalStorageManager()) {
                    promise.resolve("Permissions déjà accordées")
                } else {
                    promise.resolve("Veuillez accorder les permissions de stockage dans les paramètres Android")
                }
            } else {
                // Android 10 et moins
                val permission = ContextCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.READ_EXTERNAL_STORAGE
                )
                if (permission == PackageManager.PERMISSION_GRANTED) {
                    promise.resolve("Permissions accordées")
                } else {
                    promise.resolve("Permissions nécessaires - vérifiez les paramètres")
                }
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun testVideoAccess(path: String, promise: Promise) {
        try {
            val file = File(path)
            
            if (!file.exists()) {
                promise.reject("NOT_FOUND", "Le fichier n'existe pas: $path")
                return
            }
            
            if (!file.canRead()) {
                promise.reject("NO_PERMISSION", "Pas de permission pour lire: $path")
                return
            }
            
            val length = file.length()
            promise.resolve("✅ Fichier accessible - Taille: ${length / 1024} KB")
        } catch (e: Exception) {
            promise.reject("ERROR", "Erreur: ${e.message}")
        }
    }

    @ReactMethod
    fun listVideosInFolder(folderPath: String, promise: Promise) {
        try {
            val folder = File(folderPath)
            
            if (!folder.exists()) {
                promise.reject("NOT_FOUND", "Dossier introuvable: $folderPath")
                return
            }
            
            if (!folder.isDirectory) {
                promise.reject("NOT_DIR", "Ce n'est pas un dossier: $folderPath")
                return
            }
            
            val videoFiles = folder.listFiles { file ->
                file.extension.lowercase() in listOf("mp4", "mov", "avi", "mkv", "webm")
            }
            
            if (videoFiles == null) {
                promise.reject("NO_PERMISSION", "Impossible de lire le contenu du dossier")
                return
            }
            
            val fileList = videoFiles.joinToString("\n") { 
                "${it.name} (${it.length() / 1024} KB)"
            }
            
            promise.resolve("Trouvé ${videoFiles.size} vidéo(s):\n$fileList")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
