# Guide de test - Kiosk Harry Potter

## 🚀 Lancement rapide

### 1. Préparer l'environnement

```bash
# Vérifier Node.js
node --version  # Doit être >= 20

# Installer les dépendances
npm install

# Nettoyer le cache (si problèmes)
npm start -- --reset-cache
```

### 2. Tester sur appareil Android (RECOMMANDÉ)

```bash
# Vérifier que la tablette est connectée
adb devices

# Devrait afficher :
# List of devices attached
# XXXXXXXXXX      device

# Lancer l'app
npm run android
```

### 3. Tester sur émulateur

```bash
# Dans Android Studio :
# Tools > Device Manager > Create Device > Pixel Tablet

# Lancer l'émulateur puis :
npm run android
```

## ✅ Checklist de test

### Test 1 : Vidéo en boucle
- [ ] La vidéo se lance automatiquement
- [ ] La vidéo joue en plein écran
- [ ] La vidéo boucle infiniment
- [ ] Pas de barre de statut visible
- [ ] Orientation paysage forcée

### Test 2 : Keep Awake
- [ ] L'écran ne s'éteint pas automatiquement
- [ ] La tablette reste allumée en permanence

### Test 3 : Détection de mouvement
- [ ] Bouger/secouer la tablette
- [ ] Le panneau debug affiche "Mouvement: Détecté"
- [ ] La valeur d'accélération change

### Test 4 : Mode Kiosk
- [ ] Pas de barre de navigation visible
- [ ] Pas de barre de statut
- [ ] Bouton home désactivé (en mode kiosk complet)
- [ ] Application en plein écran

## 🐛 Résolution de problèmes

### Erreur : "No devices/emulators found"

```bash
# Relancer adb
adb kill-server
adb start-server
adb devices
```

### Erreur : Build failed

```bash
# Nettoyer et rebuilder
cd android
./gradlew clean
cd ..
npm run android
```

### Vidéo ne se lance pas

```bash
# Vérifier les logs
npx react-native log-android

# Chercher les erreurs liées à "Video"
```

### Accéléromètre ne fonctionne pas

```bash
# Sur émulateur, simuler le mouvement :
# Extended controls > Virtual sensors > Accelerometer
# Bouger les axes X, Y, Z
```

## 📱 Test de la vidéo personnalisée

### Avec vidéo locale

1. Créer le dossier assets :
```bash
mkdir -p assets/videos
```

2. Placer votre vidéo : `assets/videos/portrait.mp4`

3. Modifier `App.tsx` :
```typescript
const DEFAULT_VIDEO = require('./assets/videos/portrait.mp4');
```

### Avec URL distante

Modifier `App.tsx` :
```typescript
const DEFAULT_VIDEO = 'https://votre-serveur.com/video.mp4';
```

⚠️ Nécessite permission INTERNET (déjà configurée)

## 🎯 Test du mode kiosk complet

Pour tester le vrai mode kiosk sur tablette :

1. Installer l'APK
2. Aller dans : **Paramètres > Apps > App par défaut**
3. Définir votre app comme **Launcher par défaut**
4. Redémarrer la tablette

➡️ L'app se lancera automatiquement et sera "verrouillée"

### Sortir du mode kiosk

```bash
# Via ADB
adb shell am start -n com.android.settings/.Settings
```

## 📊 Vérifier les performances

```bash
# Monitorer les performances
npx react-native log-android | grep -i "performance\|fps\|memory"

# FPS Counter dans l'app
# Secouer l'appareil > Paramètres dev > Show Perf Monitor
```

## 🔧 Tests avancés

### Tester différentes sensibilités

Dans `src/hooks/useProximity.ts`, ajuster :

```typescript
// Moins sensible
const movementDetected = acceleration > 15;

// Plus sensible
const movementDetected = acceleration > 5;
```

### Tester le build de production

```bash
cd android
./gradlew assembleRelease

# Installer la version release
adb install app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

## 📝 Logs utiles

```bash
# Tous les logs
npx react-native log-android

# Filtrer par tag
adb logcat | grep -i "ReactNative\|Video\|Sensor"

# Erreurs uniquement
adb logcat *:E
```

## 🎥 Vidéos de test recommandées

Sites pour trouver des vidéos "tableau animé" :

- [Pexels Videos](https://www.pexels.com/search/videos/portrait/)
- [Pixabay Videos](https://pixabay.com/videos/)
- Chercher : "portrait loop", "animated portrait", "living portrait"

Format idéal :
- MP4 (H.264)
- 1080p ou 720p
- Boucle parfaite
- 10-30 secondes
