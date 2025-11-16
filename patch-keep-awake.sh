#!/bin/bash

# Patch pour react-native-keep-awake, react-native-sensors et react-native-camera - remplacer jcenter() par mavenCentral()

FILES=(
    "node_modules/react-native-keep-awake/android/build.gradle"
    "node_modules/react-native-sensors/android/build.gradle"
    "node_modules/react-native-camera/android/build.gradle"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo "📝 Patching $FILE..."
        # Remplacer jcenter() par mavenCentral()
        sed -i '' 's/jcenter()/mavenCentral()/g' "$FILE"
        echo "✅ Patch appliqué"
    else
        echo "⚠️  Fichier non trouvé: $FILE"
    fi
done

echo "✅ Tous les patchs appliqués avec succès"
