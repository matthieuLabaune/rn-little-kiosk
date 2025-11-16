import { useEffect, useState } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { MotionDetector } = NativeModules;

/**
 * Hook pour détecter le mouvement via la caméra native
 * Utilise un module natif Android qui analyse les frames de la caméra
 */
export function useNativeMotionDetection(sensitivity: number = 50, enabled: boolean = true) {
  const [hasMotion, setHasMotion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android' || !MotionDetector) {
      return;
    }

    const eventEmitter = new NativeEventEmitter(MotionDetector);

    // Écouter les événements de mouvement
    const motionSubscription = eventEmitter.addListener('onMotionDetected', () => {
      setHasMotion(true);

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setHasMotion(false);
      }, 3000);
    });

    // Écouter les erreurs
    const errorSubscription = eventEmitter.addListener('onMotionDetectorError', (errorMsg: string) => {
      setError(errorMsg);
      console.error('Motion detector error:', errorMsg);
    });

    // Démarrer la détection
    try {
      MotionDetector.startDetection(sensitivity);
    } catch (e) {
      setError(`Failed to start: ${e}`);
    }

    // Nettoyage
    return () => {
      motionSubscription.remove();
      errorSubscription.remove();
      try {
        MotionDetector.stopDetection();
      } catch (e) {
        console.error('Failed to stop detection:', e);
      }
    };
  }, [sensitivity, enabled]);

  return { hasMotion, error };
}
