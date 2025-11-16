/**
 * Kiosk Mode App - Harry Potter Animated Portraits
 * Détection de mouvement par caméra + vidéo en boucle
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {VideoPlayer} from './src/components/VideoPlayer';
import {useNativeMotionDetection} from './src/hooks/useNativeMotionDetection';
import {useVideoRotation} from './src/hooks/useVideoRotation';
import {getConfig} from './src/config/appConfig';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {ConfigStorage} from './src/services/configStorage';
import {AppSettings} from './src/config/settingsModel';

const {width, height} = Dimensions.get('window');

function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const config = getConfig();
  const {hasMotion, error} = useNativeMotionDetection(
    settings?.motionSensitivity ?? config.motionSensitivity,
    config.cameraAlwaysOn
  );
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [lastMotionTime, setLastMotionTime] = useState<number>(0);

  // Hook de rotation des vidéos
  const {getCurrentVideo, getNextVideo} = useVideoRotation(settings);
  const [currentVideo, setCurrentVideo] = useState(getCurrentVideo());

  // Triple tap detection
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  // Mettre à jour la vidéo actuelle quand les settings changent
  useEffect(() => {
    if (settings) {
      setCurrentVideo(getCurrentVideo());
    }
  }, [settings, getCurrentVideo]);

  const loadSettings = async () => {
    const loaded = await ConfigStorage.loadSettings();
    setSettings(loaded);
  };

  const handleTripleTap = () => {
    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 500); // Reset après 500ms
    }

    if (tapCountRef.current === 3) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }

      // Vérifier le PIN si kiosk verrouillé
      if (settings?.kioskLocked) {
        // TODO: Afficher prompt PIN
        // Pour l'instant on ouvre directement
        setShowSettings(true);
      } else {
        setShowSettings(true);
      }
    }
  };

  useEffect(() => {
    // Quand mouvement détecté par la caméra, activer la vidéo
    if (hasMotion) {
      const now = Date.now();
      setLastMotionTime(now);
      setIsVideoActive(true);
    }
  }, [hasMotion]);

  // Callback appelé quand la vidéo se termine
  const handleVideoEnd = () => {
    if (config.playbackMode === 'motion-detection') {
      // Passer à la vidéo suivante si rotation activée
      if (settings?.autoRotate) {
        setCurrentVideo(getNextVideo());
      }
      // Remettre en pause après la fin
      setIsVideoActive(false);
    }
  };
  // Déterminer si la vidéo doit être active selon le mode
  const shouldPlayVideo = (() => {
    switch (config.playbackMode) {
      case 'always-play':
        return true;
      case 'never-play':
        return false;
      case 'motion-detection':
        return isVideoActive; // Activé par l'accéléromètre
      case 'touch-to-play':
        return isVideoActive; // TODO: ajouter un TouchableOpacity
      default:
        return false;
    }
  })();

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <KeepAwake />

      {showSettings ? (
        <SettingsScreen
          onClose={() => {
            setShowSettings(false);
            loadSettings(); // Recharger les settings après fermeture
          }}
        />
      ) : (
        <>
          {/* Zone de triple tap (coin haut gauche) */}
          <TouchableWithoutFeedback onPress={handleTripleTap}>
            <View style={styles.settingsTrigger} />
          </TouchableWithoutFeedback>

          {/* Lecteur vidéo - joue jusqu'à la fin quand mouvement détecté */}
          <VideoPlayer
            videoSource={currentVideo}
            isActive={shouldPlayVideo}
            onEnd={handleVideoEnd}
          />

          {/* Debug info - à retirer en production */}
          {__DEV__ && settings?.showDebugOverlay && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>Mode: {config.playbackMode}</Text>
              <Text style={styles.debugText}>
                Caméra: {config.cameraAlwaysOn ? 'ON ✓' : 'OFF'}
              </Text>
              <Text style={styles.debugText}>
                Mouvement détecté: {hasMotion ? 'OUI ✓' : 'Non'}
              </Text>
              {error && (
                <Text style={styles.debugError}>
                  Erreur: {error}
                </Text>
              )}
              <Text style={styles.debugText}>
                Dernier mouvement: {lastMotionTime > 0 ? new Date(lastMotionTime).toLocaleTimeString() : 'Aucun'}
              </Text>
              <Text style={styles.debugText}>
                Vidéo: {shouldPlayVideo ? 'Active ▶' : 'Pause ⏸'}
              </Text>
              <Text style={styles.debugText}>
                Sensibilité: {settings?.motionSensitivity}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: width,
    height: height,
  },
  settingsTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    zIndex: 1000,
  },
  debugContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  debugError: {
    color: '#f00',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default App;
