import {useEffect, useState} from 'react';
import {accelerometer} from 'react-native-sensors';
import {Subscription} from 'rxjs';

/**
 * Hook pour détecter la proximité en utilisant l'accéléromètre
 * Note: react-native-sensors v7.3.6 n'expose pas directement le capteur de proximité
 * Alternative: détecter le mouvement via accéléromètre comme indicateur de présence
 */
export const useProximity = () => {
  const [isNear, setIsNear] = useState(false);
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    let subscription: Subscription | null = null;

    const setupMotionDetection = () => {
      subscription = accelerometer.subscribe(
        (data: any) => {
          // Détecter le mouvement basé sur l'accélération
          const acceleration = Math.sqrt(
            data.x * data.x + data.y * data.y + data.z * data.z,
          );
          // Seuil de détection de mouvement (environ 10 = mouvement détecté)
          const movementDetected = acceleration > 10;
          setDistance(acceleration);
          setIsNear(movementDetected);
        },
        (error: any) => {
          console.error('Motion sensor error:', error);
        },
      );
    };

    setupMotionDetection();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return {isNear, distance};
};
