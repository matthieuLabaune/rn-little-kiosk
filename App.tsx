/**
 * Kiosk Mode App - Harry Potter Animated Portraits
 * Détection de mouvement par caméra + vidéo en boucle
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { VideoPlayer } from './src/components/VideoPlayer';
import { useNativeMotionDetection } from './src/hooks/useNativeMotionDetection';
import { useVideoRotation } from './src/hooks/useVideoRotation';
import { useSchedule } from './src/hooks/useSchedule';
import { getConfig } from './src/config/appConfig';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ConfigStorage } from './src/services/configStorage';
import { AppSettings } from './src/config/settingsModel';
import { PinPrompt } from './src/components/PinPrompt';
import { MagicCorner } from './src/components/MagicCorner';
import { mqttService } from './src/services/MqttService';

const { width, height } = Dimensions.get('window');

function App() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const config = getConfig();

    // Schedule Logic
    const isSleepMode = useSchedule(settings?.schedule || {
        enabled: false,
        sleepTime: '22:00',
        wakeTime: '08:00',
        activeDays: [true, true, true, true, true, true, true]
    });

    const { hasMotion, error } = useNativeMotionDetection(
        settings?.motionSensitivity ?? config.motionSensitivity,
        config.cameraAlwaysOn && !isSleepMode // Désactiver caméra en mode veille
    );
    const [isVideoActive, setIsVideoActive] = useState(false);
    const [lastMotionTime, setLastMotionTime] = useState<number>(0);

    // Hook de rotation des vidéos
    const { getCurrentVideo, getNextVideo } = useVideoRotation(settings);
    const [currentVideo, setCurrentVideo] = useState(getCurrentVideo());

    // Triple tap detection
    const tapCountRef = useRef(0);
    const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    // MQTT Initialization
    useEffect(() => {
        if (settings?.mqtt) {
            mqttService.connect(settings.mqtt);

            mqttService.setCommandHandler((command) => {
                console.log('MQTT Command:', command);
                switch (command) {
                    case 'screen_on':
                        // TODO: Wake screen if possible (requires native module or just activity)
                        break;
                    case 'screen_off':
                        // Handled by sleep mode logic if we integrate it deeper
                        break;
                    case 'play':
                        setIsVideoActive(true);
                        break;
                    case 'pause':
                        setIsVideoActive(false);
                        break;
                    case 'next':
                        setCurrentVideo(getNextVideo());
                        break;
                    case 'reload':
                        loadSettings();
                        break;
                }
            });
        }
        return () => {
            mqttService.disconnect();
        };
    }, [settings?.mqtt]);

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

    const handleMagicAction = (action: string) => {
        switch (action) {
            case 'settings':
                // Vérifier le PIN si kiosk verrouillé
                if (settings?.kioskLocked) {
                    setShowPinPrompt(true);
                } else {
                    setShowSettings(true);
                }
                break;
            case 'next_video':
                setCurrentVideo(getNextVideo());
                break;
            case 'pause_resume':
                setIsVideoActive(!isVideoActive);
                break;
        }
    };

    useEffect(() => {
        // Quand mouvement détecté par la caméra, activer la vidéo
        if (hasMotion) {
            const now = Date.now();
            setLastMotionTime(now);
            setIsVideoActive(true);
            mqttService.publish('motion', 'detected');
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
            {(!settings || (settings.keepScreenOn && !isSleepMode)) && <KeepAwake />}

            {isSleepMode ? (
                <View style={styles.sleepContainer}>
                    <Text style={styles.sleepText}>Zzz...</Text>
                </View>
            ) : (
                <>
                    {showSettings ? (
                        <SettingsScreen
                            onClose={() => {
                                setShowSettings(false);
                                loadSettings(); // Recharger les settings après fermeture
                            }}
                        />
                    ) : (
                        <>
                            <PinPrompt
                                visible={showPinPrompt}
                                correctPin={settings?.kioskPin || '1234'}
                                onSuccess={() => {
                                    setShowPinPrompt(false);
                                    setShowSettings(true);
                                }}
                                onCancel={() => setShowPinPrompt(false)}
                            />
                            {/* Magic Corners */}
                            {settings?.magicCorners && (
                                <>
                                    <MagicCorner
                                        position="topLeft"
                                        config={settings.magicCorners.topLeft}
                                        onAction={handleMagicAction}
                                    />
                                    <MagicCorner
                                        position="topRight"
                                        config={settings.magicCorners.topRight}
                                        onAction={handleMagicAction}
                                    />
                                    <MagicCorner
                                        position="bottomLeft"
                                        config={settings.magicCorners.bottomLeft}
                                        onAction={handleMagicAction}
                                    />
                                    <MagicCorner
                                        position="bottomRight"
                                        config={settings.magicCorners.bottomRight}
                                        onAction={handleMagicAction}
                                    />
                                </>
                            )}

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
    sleepContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sleepText: {
        color: '#333',
        fontSize: 20,
    },
});

export default App;
