package com.rnparryhotterkiosk

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(MotionDetectorPackage()) // Module natif pour détection de mouvement
          add(VideoScannerPackage()) // Module natif pour scanner les vidéos
          add(FileImporterPackage()) // Module natif pour importer les vidéos
          add(PermissionsPackage()) // Module natif pour gérer les permissions
          add(KioskPackage()) // Module natif Kiosk (Lock Task)
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
