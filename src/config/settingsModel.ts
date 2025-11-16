export interface VideoPackConfig {
  id: string;
  name: string;
  folder: string;
  videoCount: number;
}

export interface ScheduleConfig {
  enabled: boolean;
  sleepTime: string; // Format HH:mm
  wakeTime: string;
  activeDays: boolean[]; // [Lun, Mar, Mer, Jeu, Ven, Sam, Dim]
}

export interface AppSettings {
  // Gestion des vidéos
  videoPack: VideoPackConfig;
  autoRotate: boolean;
  rotationMode: 'random' | 'sequential';
  playDuration: 'full' | number; // 'full' ou secondes (5, 10, 15, 30)
  transitionEffect: 'none' | 'fade' | 'crossfade';

  // Détection de mouvement
  motionSensitivity: number; // 0-100
  detectionZone: 'fullscreen' | 'center' | 'sides';
  inactivityDelay: number; // secondes avant pause (5, 10, 30, 60, 120)
  detectionMode: 'camera' | 'accelerometer' | 'proximity' | 'combined';

  // Programmation horaire
  schedule: ScheduleConfig;
  energySaving: boolean;
  energySavingDelay: number; // minutes avant réduction luminosité

  // Affichage
  brightness: number; // 0-100, -1 pour auto
  idleImage: 'none' | 'static' | 'slowvideo';
  showDebugOverlay: boolean;
  fullscreenMode: boolean;

  // Système
  kioskLocked: boolean;
  kioskPin: string;
  autoUpdate: boolean;
  storageLocation: 'internal' | 'sdcard';
  enableLogs: boolean;

  // Audio
  soundEnabled: boolean;
  volume: number; // 0-100
  detectionSound: boolean;
}

export const VIDEO_PACKS: VideoPackConfig[] = [
  {
    id: 'harry-potter',
    name: 'Harry Potter Portraits',
    folder: '/data/user/0/com.rnparryhotterkiosk/files/videos',
    videoCount: 8,
  },
  {
    id: 'classic-portraits',
    name: 'Portraits Classiques',
    folder: '/data/user/0/com.rnparryhotterkiosk/files/classic',
    videoCount: 0,
  },
  {
    id: 'custom',
    name: 'Pack Personnalisé',
    folder: '/data/user/0/com.rnparryhotterkiosk/files/custom',
    videoCount: 0,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  // Vidéos
  videoPack: VIDEO_PACKS[0],
  autoRotate: true,
  rotationMode: 'random',
  playDuration: 'full',
  transitionEffect: 'none',

  // Détection
  motionSensitivity: 80,
  detectionZone: 'fullscreen',
  inactivityDelay: 10,
  detectionMode: 'camera',

  // Horaires
  schedule: {
    enabled: false,
    sleepTime: '22:00',
    wakeTime: '08:00',
    activeDays: [true, true, true, true, true, true, true],
  },
  energySaving: false,
  energySavingDelay: 30,

  // Affichage
  brightness: -1, // Auto
  idleImage: 'slowvideo',
  showDebugOverlay: false,
  fullscreenMode: true,

  // Système
  kioskLocked: false,
  kioskPin: '1234',
  autoUpdate: false,
  storageLocation: 'internal',
  enableLogs: true,

  // Audio
  soundEnabled: false,
  volume: 50,
  detectionSound: false,
};
