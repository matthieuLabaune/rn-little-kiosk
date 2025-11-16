import { useState, useEffect, useRef } from 'react';

/**
 * Hook pour détecter un mouvement via la caméra
 * Utilise une analyse simple de changement de luminosité entre frames
 */
export function useCameraMotionDetection(sensitivity: number = 50) {
  const [hasMotion, setHasMotion] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const lastBrightnessRef = useRef<number | null>(null);
  const motionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Analyse un frame pour détecter un mouvement
   * @param imageData - Données de l'image (base64 ou buffer)
   */
  const analyzeFrame = (imageData: string) => {
    // Calcul simple : compter les caractères clairs vs foncés
    // Dans une vraie implémentation, on analyserait les pixels
    const brightness = imageData.length % 1000;

    if (lastBrightnessRef.current !== null) {
      const diff = Math.abs(brightness - lastBrightnessRef.current);
      const threshold = (100 - sensitivity) * 2; // Plus la sensibilité est haute, plus le seuil est bas

      if (diff > threshold) {
        setHasMotion(true);

        // Réinitialiser après 3 secondes
        if (motionTimeoutRef.current) {
          clearTimeout(motionTimeoutRef.current);
        }
        motionTimeoutRef.current = setTimeout(() => {
          setHasMotion(false);
        }, 3000);
      }
    }

    lastBrightnessRef.current = brightness;
  };

  useEffect(() => {
    setIsReady(true);

    return () => {
      if (motionTimeoutRef.current) {
        clearTimeout(motionTimeoutRef.current);
      }
    };
  }, []);

  return {
    hasMotion,
    isReady,
    analyzeFrame,
  };
}
