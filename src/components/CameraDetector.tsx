import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

interface CameraDetectorProps {
  isEnabled: boolean;
  onMotionDetected: () => void;
  sensitivity: number;
}

/**
 * Composant caméra invisible pour la détection de mouvement
 * La caméra tourne en arrière-plan et détecte les mouvements
 */
export const CameraDetector: React.FC<CameraDetectorProps> = ({
  isEnabled,
  onMotionDetected,
  sensitivity,
}) => {
  const cameraRef = useRef<RNCamera>(null);
  const lastBrightness = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Attendre que le composant soit monté avant d'activer la caméra
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000); // Délai de 1 seconde pour s'assurer que React Native est prêt

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEnabled && isMounted && cameraRef.current) {
      // Analyser les frames toutes les 500ms (moins fréquent = plus stable)
      intervalRef.current = setInterval(async () => {
        try {
          if (!cameraRef.current) return;

          const options = {
            quality: 0.1,
            base64: true,
            width: 64,
            doNotSave: true,
          };

          const data = await cameraRef.current.takePictureAsync(options);

          if (data.base64) {
            const brightness = data.base64.length;

            if (lastBrightness.current !== null) {
              const diff = Math.abs(brightness - lastBrightness.current);
              const threshold = (100 - sensitivity) * 100;

              if (diff > threshold) {
                onMotionDetected();
              }
            }

            lastBrightness.current = brightness;
          }
        } catch {
          // Ignorer les erreurs
        }
      }, 500); // 500ms au lieu de 300ms
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, isMounted, sensitivity, onMotionDetected]);

  if (!isEnabled || !isMounted) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.front}
        captureAudio={false}
        onMountError={(error) => {
          console.warn('Camera mount error:', error);
        }}
        androidCameraPermissionOptions={{
          title: 'Permission caméra',
          message: 'Autoriser la caméra pour détecter les mouvements',
          buttonPositive: 'OK',
          buttonNegative: 'Annuler',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  camera: {
    width: 1,
    height: 1,
  },
});
