#!/bin/bash

# Script to generate a release keystore for Android

KEYSTORE_FILE="android/app/my-release-key.keystore"
ALIAS="my-key-alias"

if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  Keystore already exists at $KEYSTORE_FILE"
    echo "Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" != "y" ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo "🔐 Generating new keystore..."
keytool -genkey -v -keystore $KEYSTORE_FILE -alias $ALIAS -keyalg RSA -keysize 2048 -validity 10000

echo ""
echo "✅ Keystore generated at: $KEYSTORE_FILE"
echo "🔑 Alias: $ALIAS"
echo ""
echo "⚠️  IMPORTANT: Keep this file safe! You will need it to update your app on the Play Store."
echo ""
echo "To build a release APK, run:"
echo "cd android && ./gradlew assembleRelease -PMYAPP_UPLOAD_STORE_FILE=my-release-key.keystore -PMYAPP_UPLOAD_STORE_PASSWORD=YOUR_PASSWORD -PMYAPP_UPLOAD_KEY_ALIAS=my-key-alias -PMYAPP_UPLOAD_KEY_PASSWORD=YOUR_PASSWORD"
