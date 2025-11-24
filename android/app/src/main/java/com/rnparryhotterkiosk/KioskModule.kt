package com.rnparryhotterkiosk

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KioskModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "KioskModule"
    }

    @ReactMethod
    fun startLockTask(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        try {
            activity.startLockTask()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("LOCK_TASK_FAILED", e.message)
        }
    }

    @ReactMethod
    fun stopLockTask(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NULL", "Activity is null")
            return
        }

        try {
            activity.stopLockTask()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_LOCK_TASK_FAILED", e.message)
        }
    }

    @ReactMethod
    fun isInLockTaskMode(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.resolve(false)
            return
        }

        try {
            val am = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
            // Note: getLockTaskModeState is API 23+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val state = am.lockTaskModeState
                promise.resolve(state != android.app.ActivityManager.LOCK_TASK_MODE_NONE)
            } else {
                // Fallback for older versions (not perfect but sufficient for this target)
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.reject("APP_NOT_FOUND", "Package not found: $packageName")
            }
        } catch (e: Exception) {
            promise.reject("LAUNCH_FAILED", e.message)
        }
    }
}
