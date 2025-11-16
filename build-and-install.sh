#!/bin/bash

echo "🔧 Build APK avec bundle embarqué..."

# 1. Créer le dossier assets
mkdir -p android/app/src/main/assets

# 2. Générer le bundle JavaScript
echo "📦 Génération du bundle JavaScript..."
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la génération du bundle"
    exit 1
fi

# 3. Build l'APK
echo "🔨 Compilation de l'APK..."
cd android
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation"
    exit 1
fi

cd ..

# 4. Installer sur la tablette
echo "📲 Installation sur la tablette..."
adb install -r android/app/build/outputs/apk/debug/app-arm64-v8a-debug.apk

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation"
    exit 1
fi

# 5. Lancer l'app
echo "🚀 Lancement de l'app..."
adb shell am start -n com.rnparryhotterkiosk/.MainActivity

echo "✅ Terminé ! L'app devrait se lancer sur votre tablette."
