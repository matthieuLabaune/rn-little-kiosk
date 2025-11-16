# Kiosk Mode Harry Potter - React Native

Application React Native en mode kiosk pour tablette Samsung Galaxy Tab 8, simulant les tableaux animés Harry Potter avec détection de présence.

## 🎯 Fonctionnalités

- **Mode Kiosk** : Application en plein écran, orientation paysage forcée
- **Détection de présence** : Utilisation de l'accéléromètre pour détecter le mouvement
- **Lecteur vidéo en boucle** : Affichage de vidéos style "tableaux animés Harry Potter"
- **Keep Awake** : L'écran reste allumé en permanence
- **Optimisé pour Galaxy Tab 8** : Configuration Android spécifique

## 📋 Prérequis

- Node.js >= 20
- React Native 0.82.1
- Android Studio avec SDK Android
- JDK 17

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Installer les pods iOS (si nécessaire)
cd ios && pod install && cd ..
```

## 🔧 Configuration

### Vidéo personnalisée

Remplacer l'URL de la vidéo dans `App.tsx` :

```typescript
const DEFAULT_VIDEO = 'https://votre-url-video.mp4';
// ou utiliser une vidéo locale
const DEFAULT_VIDEO = require('./assets/videos/portrait.mp4');
```

### Mode Kiosk

L'application est configurée pour :
- Plein écran (pas de barre de statut)
- Orientation paysage forcée
- Permissions WAKE_LOCK pour garder l'écran allumé
- Category HOME pour mode kiosk

## 📱 Développement

```bash
# Démarrer Metro
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
```

## 📦 Build APK

### Debug APK
```bash
cd android
./gradlew assembleDebug
```

L'APK sera dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK

1. **Générer une clé de signature** (première fois uniquement) :
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurer gradle.properties** :
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=****
MYAPP_RELEASE_KEY_PASSWORD=****
```

3. **Builder l'APK** :
```bash
cd android
./gradlew assembleRelease
```

L'APK sera dans : `android/app/build/outputs/apk/release/`

### APK Split par architecture

L'application génère des APK séparés par architecture :
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM) ← **Pour Galaxy Tab 8**
- `app-x86-release.apk` (émulateur)
- `app-x86_64-release.apk` (émulateur)

## 🎨 Structure du projet

```
src/
├── components/
│   └── VideoPlayer.tsx      # Composant lecteur vidéo
├── hooks/
│   └── useProximity.ts      # Hook détection de mouvement
└── types/
    └── react-native-keep-awake.d.ts  # Types TypeScript
```

## ⚙️ Configuration Android

### AndroidManifest.xml
- Permissions : WAKE_LOCK, SYSTEM_ALERT_WINDOW, DISABLE_KEYGUARD
- Category : HOME pour mode kiosk
- Orientation : landscape
- Theme : NoActionBar

### build.gradle
- Split APK par architecture
- Optimisations ProGuard (release)
- Shrink resources activé

## 🐛 Debug

En mode développement (`__DEV__`), un panneau de debug s'affiche :
- État de détection de mouvement
- Valeur d'accélération
- État de la vidéo (active/pause)

## 📝 Notes

### Détection de proximité

L'API `react-native-sensors` v7.3.6 n'expose pas directement le capteur de proximité. L'application utilise l'**accéléromètre** comme alternative pour détecter le mouvement/présence.

Pour ajuster la sensibilité, modifier le seuil dans `src/hooks/useProximity.ts` :

```typescript
const movementDetected = acceleration > 10; // Ajuster cette valeur
```

### Vidéos recommandées

Pour un effet "tableau animé Harry Potter" authentique :
- Format : MP4 (H.264)
- Ratio : 9:16 (portrait) ou 16:9 (paysage)
- Résolution : 1080p ou 720p
- Boucle parfaite (début = fin)

## 📄 Licence

MIT

## 🔗 Dépendances principales

- `react-native-video` : Lecteur vidéo
- `react-native-sensors` : Accès aux capteurs
- `react-native-keep-awake` : Garder l'écran allumé

```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
