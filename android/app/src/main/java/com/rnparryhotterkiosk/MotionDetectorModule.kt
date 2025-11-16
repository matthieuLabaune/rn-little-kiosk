package com.rnparryhotterkiosk

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.ImageFormat
import android.hardware.camera2.*
import android.media.Image
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.nio.ByteBuffer

/**
 * Module natif pour détecter le mouvement via la caméra
 * Utilise Camera2 API pour analyser les frames en arrière-plan
 */
class MotionDetectorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var imageReader: ImageReader? = null
    private var backgroundThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null
    private var isDetecting = false
    private var lastBrightness: Long = 0
    private var sensitivity: Int = 50

    override fun getName(): String = "MotionDetector"

    @ReactMethod
    fun startDetection(sens: Int) {
        Log.d(TAG, "startDetection called with sensitivity: $sens")

        if (isDetecting) {
            Log.d(TAG, "Already detecting, ignoring")
            return
        }

        sensitivity = sens

        // Vérifier la permission caméra
        if (ActivityCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.CAMERA
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            sendError("Camera permission not granted")
            return
        }

        startBackgroundThread()
        openCamera()
    }

    @ReactMethod
    fun stopDetection() {
        Log.d(TAG, "stopDetection called")
        closeCamera()
        stopBackgroundThread()
        isDetecting = false
    }

    private fun startBackgroundThread() {
        backgroundThread = HandlerThread("CameraBackground").also { it.start() }
        backgroundHandler = Handler(backgroundThread!!.looper)
    }

    private fun stopBackgroundThread() {
        backgroundThread?.quitSafely()
        try {
            backgroundThread?.join()
            backgroundThread = null
            backgroundHandler = null
        } catch (e: InterruptedException) {
            Log.e(TAG, "Error stopping background thread", e)
        }
    }

    private fun openCamera() {
        try {
            val manager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = getFrontCameraId(manager) ?: run {
                sendError("No front camera found")
                return
            }

            Log.d(TAG, "Opening front camera: $cameraId")

            // Créer ImageReader pour recevoir les frames
            imageReader = ImageReader.newInstance(
                176, 144, // Résolution très basse pour performance
                ImageFormat.YUV_420_888,
                2
            ).apply {
                setOnImageAvailableListener({ reader ->
                    val image = reader.acquireLatestImage()
                    image?.let {
                        analyzeImage(it)
                        it.close()
                    }
                }, backgroundHandler)
            }

            if (ActivityCompat.checkSelfPermission(
                    reactApplicationContext,
                    Manifest.permission.CAMERA
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                sendError("Camera permission denied")
                return
            }

            manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
                override fun onOpened(camera: CameraDevice) {
                    Log.d(TAG, "Camera opened successfully")
                    cameraDevice = camera
                    createCaptureSession()
                }

                override fun onDisconnected(camera: CameraDevice) {
                    Log.d(TAG, "Camera disconnected")
                    camera.close()
                    cameraDevice = null
                }

                override fun onError(camera: CameraDevice, error: Int) {
                    Log.e(TAG, "Camera error: $error")
                    sendError("Camera error: $error")
                    camera.close()
                    cameraDevice = null
                }
            }, backgroundHandler)

        } catch (e: Exception) {
            Log.e(TAG, "Error opening camera", e)
            sendError("Failed to open camera: ${e.message}")
        }
    }

    private fun getFrontCameraId(manager: CameraManager): String? {
        return manager.cameraIdList.firstOrNull { id ->
            val characteristics = manager.getCameraCharacteristics(id)
            characteristics.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT
        }
    }

    private fun createCaptureSession() {
        try {
            val surface = imageReader?.surface ?: return

            val captureRequestBuilder = cameraDevice?.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)?.apply {
                addTarget(surface)
            }

            cameraDevice?.createCaptureSession(
                listOf(surface),
                object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(session: CameraCaptureSession) {
                        Log.d(TAG, "Capture session configured")
                        captureSession = session
                        isDetecting = true

                        try {
                            // Démarrer la capture en continu
                            captureRequestBuilder?.let {
                                session.setRepeatingRequest(
                                    it.build(),
                                    null,
                                    backgroundHandler
                                )
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error starting capture", e)
                            sendError("Failed to start capture: ${e.message}")
                        }
                    }

                    override fun onConfigureFailed(session: CameraCaptureSession) {
                        Log.e(TAG, "Capture session configuration failed")
                        sendError("Failed to configure capture session")
                    }
                },
                backgroundHandler
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error creating capture session", e)
            sendError("Failed to create session: ${e.message}")
        }
    }

    private fun analyzeImage(image: Image) {
        try {
            // Analyser seulement le plan Y (luminance) pour détecter changement
            val buffer: ByteBuffer = image.planes[0].buffer
            var brightness: Long = 0
            val sampleSize = 100.coerceAtMost(buffer.remaining())

            for (i in 0 until sampleSize) {
                brightness += (buffer.get(i).toInt() and 0xFF)
            }
            brightness /= sampleSize

            if (lastBrightness != 0L) {
                val diff = kotlin.math.abs(brightness - lastBrightness)
                // Seuil ultra-sensible : même un petit mouvement de main sera détecté
                val threshold = (100 - sensitivity) * 0.5

                if (diff > threshold) {
                    Log.d(TAG, "Motion detected! diff=$diff, threshold=$threshold, brightness=$brightness")
                    sendEvent("onMotionDetected", null)
                }
            }

            lastBrightness = brightness
        } catch (e: Exception) {
            Log.e(TAG, "Error analyzing image", e)
        }
    }

    private fun closeCamera() {
        try {
            captureSession?.close()
            captureSession = null
            cameraDevice?.close()
            cameraDevice = null
            imageReader?.close()
            imageReader = null
        } catch (e: Exception) {
            Log.e(TAG, "Error closing camera", e)
        }
    }

    private fun sendEvent(eventName: String, data: String?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    private fun sendError(message: String) {
        Log.e(TAG, message)
        sendEvent("onMotionDetectorError", message)
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        stopDetection()
    }

    companion object {
        private const val TAG = "MotionDetector"
    }
}
