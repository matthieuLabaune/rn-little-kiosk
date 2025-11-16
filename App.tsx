/**
 * Kiosk Mode App - Harry Potter Animated Portraits
 * Détection de mouvement par caméra + vidéo en boucle
 */

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {VideoPlayer} from './src/components/VideoPlayer';
import {useNativeMotionDetection} from './src/hooks/useNativeMotionDetection';
import {getConfig} from './src/config/appConfig';

const {width, height} = Dimensions.get('window');

// Vidéo depuis le stockage interne de l'app
const DEFAULT_VIDEO = {uri: 'file:///data/user/0/com.rnparryhotterkiosk/files/videos/portrait1.mp4'};

function App() {
  const config = getConfig();
  const {hasMotion, error} = useNativeMotionDetection(config.motionSensitivity, config.cameraAlwaysOn);
  const [isVideoActive, setIsVideoActive] = useState(false); // Pause par défaut
  const [lastMotionTime, setLastMotionTime] = useState<number>(0);

  useEffect(() => {
    // Quand mouvement détecté par la caméra, activer la vidéo
    // Elle jouera jusqu'à la fin (gérée par onEnd dans VideoPlayer)
    if (hasMotion) {
      const now = Date.now();
      setLastMotionTime(now);
      setIsVideoActive(true);
    }
  }, [hasMotion]);

  // Callback appelé quand la vidéo se termine
  const handleVideoEnd = () => {
    if (config.playbackMode === 'motion-detection') {
      setIsVideoActive(false); // Remettre en pause après la fin
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

      {/* Lecteur vidéo - joue jusqu'à la fin quand mouvement détecté */}
      <VideoPlayer 
        videoSource={DEFAULT_VIDEO} 
        isActive={shouldPlayVideo}
        onEnd={handleVideoEnd}
      />

      {/* Debug info - à retirer en production */}
      {__DEV__ && (
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
        </View>
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
