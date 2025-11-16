/**
 * Configuration de l'application
 * TODO: Sera remplacé par un panneau de configuration UI
 */

export type PlaybackMode =
  | 'motion-detection'  // Play sur détection de mouvement (caméra)
  | 'always-play'       // Toujours en lecture
  | 'never-play'        // Jamais en lecture (pause)
  | 'touch-to-play';    // Play au toucher

export interface AppConfig {
  // Mode de lecture vidéo
  playbackMode: PlaybackMode;

  // Caméra toujours active (pour détection de mouvement)
  cameraAlwaysOn: boolean;

  // Sensibilité de la détection de mouvement (0-100)
  motionSensitivity: number;

  // Durée de lecture après détection (en secondes)
  playDuration: number;

  // Vidéos à utiliser
  videoFiles: string[];
}

// Configuration par défaut
export const DEFAULT_CONFIG: AppConfig = {
  playbackMode: 'motion-detection', // Détection par caméra
  cameraAlwaysOn: true,
  motionSensitivity: 80, // Plus sensible (0-100, plus c'est haut plus c'est sensible)
  playDuration: 5, // 5 secondes après détection
  videoFiles: ['portrait1.mp4'], // TODO: ajouter les 8 vidéos
};

// Configuration actuelle (sera modifiable via UI plus tard)
let currentConfig: AppConfig = { ...DEFAULT_CONFIG };

export const getConfig = (): AppConfig => currentConfig;

export const updateConfig = (config: Partial<AppConfig>) => {
  currentConfig = { ...currentConfig, ...config };
};
