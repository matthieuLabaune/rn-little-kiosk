# Spécifications Techniques - RN Little Kiosk

## 📋 Vue d'ensemble

Application React Native transformant une tablette en affichage de portrait animé avec détection de mouvement. Destinée à un usage en mode kiosque 24/7 pour musées, expositions, ou installations artistiques.

## 🎯 Objectifs

- **Expérience immersive** : Affichage plein écran sans distractions
- **Activation par mouvement** : Détection automatique de présence humaine
- **Rotation vidéo** : Support de multiples vidéos avec changement automatique
- **Configuration flexible** : Paramètres accessibles mais protégés
- **Performance** : Fonctionnement stable 24/7 avec faible consommation

## 🏗️ Architecture Technique

### Stack Technologique

- **Framework** : React Native 0.82.1
- **Langage** : TypeScript 5.x
- **Platform** : Android (optimisé pour tablettes)
- **Build System** : Gradle 9.0.0
- **Lecteur vidéo** : react-native-video 6.17.0 avec ExoPlayer

### Modules Natifs Custom

#### 1. MotionDetectorModule (Kotlin)
- **API** : Camera2 (Android)
- **Format** : YUV_420_888
- **Algorithme** : Détection par analyse de luminosité
- **Performance** : < 100ms de latence
- **Configuration** :
  - Sensibilité : 0-100 (défaut: 80)
  - Seuil dynamique : `(100 - sensitivity) * 0.5`
  - Échantillonnage : 100 pixels par frame

#### 2. VideoScannerModule (Kotlin)
- Scan de dossiers pour fichiers vidéo
- Formats supportés : mp4, mov, avi, mkv, webm
- Retourne : nom, path, uri, taille

#### 3. FileImporterModule (Kotlin)
- Import depuis `/sdcard/Download/`
- Copie vers répertoire app `/files/videos/`
- Gestion des conflits de noms

#### 4. PermissionsModule (Kotlin)
- Diagnostic des permissions storage
- Test d'accessibilité des fichiers
- Liste des vidéos dans dossier spécifié

### Hooks React

#### useNativeMotionDetection
```typescript
{
  isMotionDetected: boolean,
  startDetection: (sensitivity: number) => void,
  stopDetection: () => void
}
```

#### useVideoRotation
```typescript
{
  getCurrentVideo: () => {uri: string},
  getNextVideo: () => {uri: string}
}
```
- Mode aléatoire : évite répétition immédiate
- Mode séquentiel : lecture en ordre

#### useVideoScanner
```typescript
{
  videos: VideoInfo[],
  scanVideos: (path: string) => void,
  isScanning: boolean
}
```

## 📱 Interface Utilisateur

### Écran Principal (App.tsx)
- **Layout** : Plein écran, orientation portrait verrouillée
- **Composants** :
  - VideoPlayer (react-native-video)
  - Overlay de debug (optionnel)
  - Accès settings via triple-tap

### Écran Paramètres (SettingsScreen.tsx)
- **Accès** : Triple-tap ou geste caché
- **Sections** :
  1. **Vidéos** :
     - Chemin du dossier (éditable)
     - Boutons raccourcis (App/videos, Download, Movies)
     - Diagnostic d'accès
     - Import depuis Download
     - Mode rotation (Aléatoire/Séquentiel)
     - Auto-rotation ON/OFF
  
  2. **Détection de Mouvement** :
     - Sensibilité (0-100, boutons +/- 50px)
     - Délai inactivité
     - Zone de détection
  
  3. **Planification** :
     - Heures actives (futur)
     - Jours actifs (futur)
  
  4. **Affichage** :
     - Luminosité (boutons +/-)
     - Mode plein écran
     - Overlay debug
  
  5. **Système** :
     - Code PIN (futur)
     - Logs (futur)
  
  6. **Audio** :
     - Volume (futur)
     - Mode silence (futur)

## 🔐 Permissions Android

### Requises
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### Gestion
- Android 13+ : `READ_MEDIA_VIDEO` prioritaire
- Android < 13 : `READ_EXTERNAL_STORAGE`
- Diagnostic intégré via PermissionsModule
- Accordées manuellement via `adb` si besoin

## 💾 Stockage des Données

### Configuration (AsyncStorage)
```typescript
interface Settings {
  videoFolderPath: string;          // "/sdcard/Download/"
  motionSensitivity: number;        // 0-100
  inactivityDelay: number;          // millisecondes
  autoRotateEnabled: boolean;       // true/false
  rotationMode: 'random' | 'sequential';
  brightness: number;               // 0-100
  fullscreenMode: boolean;          // true
  debugOverlay: boolean;            // false
  videoCount: number;               // nombre de vidéos
}
```

### Vidéos
- **Emplacement recommandé** : `/sdcard/Download/`
- **Nomenclature** : `portrait1.mp4`, `portrait2.mp4`, ...
- **Format** : Portrait 9:16 ou similaire
- **Taille** : Optimisée pour tablette (< 5MB recommandé)

## 🎬 Flux de Fonctionnement

### Cycle de Vie
```
1. Démarrage app
   ↓
2. Chargement settings (AsyncStorage)
   ↓
3. Scan dossier vidéos
   ↓
4. Démarrage détection mouvement
   ↓
5. État veille (vidéo pause)
   ↓
6. [MOUVEMENT DÉTECTÉ]
   ↓
7. Lecture vidéo complète
   ↓
8. onEnd → Rotation automatique (si activée)
   ↓
9. Retour état veille
```

### Gestion de la Rotation
**Mode Aléatoire** :
```typescript
- Tracking: usedVideos = []
- Sélection: index aléatoire non utilisé
- Reset: quand usedVideos.length === videoCount
```

**Mode Séquentiel** :
```typescript
- Index: currentIndex++
- Wrap: currentIndex % videoCount
```

## 🔧 Configuration Build

### Gradle
- **Version** : 9.0.0
- **APK** : Standalone avec bundle JS embarqué
- **Architecture** : ARM64-v8a (tablettes Samsung)
- **Optimisations** :
  - ProGuard désactivé (debug)
  - Incremental builds
  - Build time : ~1 seconde

### Scripts Utilitaires
```bash
./build-and-install.sh    # Build + Install + Launch
./copy-videos.sh          # Copie vidéos Mac → Tablette
```

## 📊 Performance

### Métriques
- **Démarrage** : < 2 secondes
- **Détection mouvement** : < 100ms latency
- **Changement vidéo** : Instantané
- **Mémoire** : ~150MB en fonctionnement
- **CPU** : ~5-10% idle, ~20-30% lecture vidéo

### Optimisations
- React.memo sur composants statiques
- Debounce des événements motion
- Cleanup proper des listeners
- Libération mémoire entre vidéos

## 🚀 Device Target

### Primaire
- **Modèle** : Samsung Galaxy Tab 8
- **ID** : R9YTA088WHW
- **Android** : 13+
- **Architecture** : ARM64-v8a

### Compatibilité
- Android 10+ minimum
- Tablettes 8-10 pouces
- Orientation portrait
- Caméra avant ou arrière

## 🔄 Workflow Développement

### Installation
```bash
npm install
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Tests
```bash
npm test                  # Jest unit tests
./build-and-install.sh    # Test complet sur device
```

### Debugging
- React DevTools
- Chrome DevTools (port 8081)
- Android Logcat : `adb logcat | grep MotionDetector`
- Debug overlay dans l'app

## 📝 Conventions de Code

### Git Commits
Format : Conventional Commits
```
feat(scope): description courte
fix(scope): description du bug
chore: tâches maintenance
docs: documentation
```

### TypeScript
- Strict mode activé
- Interfaces pour props
- Types explicites sur fonctions
- Éviter `any`

### Kotlin
- Null safety
- Extension functions
- Data classes pour models
- Logging avec TAG constant

## 🎯 Roadmap

### Phase 1 - ✅ Complété
- [x] Détection mouvement Camera2
- [x] Lecture vidéo avec activation
- [x] Rotation vidéo (random/sequential)
- [x] Écran settings complet
- [x] Modules natifs (Scanner, Importer, Permissions)
- [x] AsyncStorage persistence
- [x] Documentation

### Phase 2 - En cours
- [ ] Protection PIN
- [ ] Planification horaires
- [ ] Analytics usage
- [ ] Logs système

### Phase 3 - Futur
- [ ] Sync cloud vidéos
- [ ] Packs de vidéos thématiques
- [ ] Effets transition
- [ ] Support audio ambiant
- [ ] Multi-device sync
- [ ] Dashboard web admin

## 🐛 Problèmes Connus

### Résolu
- ✅ Permission READ_MEDIA_VIDEO non accordée → Solution: `adb shell pm grant`
- ✅ Vidéos noms base64 incompatibles → Renommage en portrait1-8.mp4
- ✅ Écran noir après motion → Ajout `seek(0)` sur réactivation

### À Surveiller
- Battery drain en usage prolongé
- Crash potentiel si dossier vidéos vide
- Performance avec 50+ vidéos

## 📞 Support

- **Repository** : https://github.com/matthieuLabaune/rn-little-kiosk
- **Issues** : GitHub Issues
- **Documentation** : README.md + SPECS.md

---

**Version** : 1.0.0  
**Dernière mise à jour** : 16 novembre 2025  
**Auteur** : Matthieu Labaune
