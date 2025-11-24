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

export type MagicCornerAction = 'none' | 'settings' | 'next_video' | 'pause_resume' | 'open_app';

export interface MagicCornerConfig {
    action: MagicCornerAction;
    payload?: string; // Package name for 'open_app'
}

export interface MqttConfig {
    enabled: boolean;
    brokerUrl: string; // ws://192.168.1.x:9001
    username?: string;
    password?: string;
    topicPrefix: string; // default 'mylittlekiosk'
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
    kioskMode: boolean; // Screen Pinning / Lock Task
    autoUpdate: boolean;
    storageLocation: 'internal' | 'sdcard';
    enableLogs: boolean;
    keepScreenOn: boolean;
    ignoreBatteryOptimizations: boolean;

    // Audio
    soundEnabled: boolean;
    volume: number; // 0-100
    detectionSound: boolean;

    // Magic Corners
    magicCorners: {
        topLeft: MagicCornerConfig;
        topRight: MagicCornerConfig;
        bottomLeft: MagicCornerConfig;
        bottomRight: MagicCornerConfig;
    };

    // MQTT
    mqtt: MqttConfig;
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
    motionSensitivity: 50,
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
    kioskMode: false,
    autoUpdate: false,
    storageLocation: 'internal',
    enableLogs: true,
    keepScreenOn: true,
    ignoreBatteryOptimizations: false,

    // Audio
    soundEnabled: false,
    volume: 50,
    detectionSound: false,

    // Magic Corners
    magicCorners: {
        topLeft: { action: 'settings' },
        topRight: { action: 'next_video' },
        bottomLeft: { action: 'none' },
        bottomRight: { action: 'pause_resume' },
    },

    // MQTT
    mqtt: {
        enabled: false,
        brokerUrl: 'ws://192.168.1.50:9001',
        topicPrefix: 'mylittlekiosk',
    },
};
