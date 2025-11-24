import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    NativeModules,
} from 'react-native';

const { FileImporter, PermissionsModule } = NativeModules;
import Slider from '@react-native-community/slider';
import { AppSettings, VIDEO_PACKS, MagicCornerAction, MagicCornerConfig } from '../config/settingsModel';
import { ConfigStorage } from '../services/configStorage';

interface SettingsScreenProps {
    onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const loaded = await ConfigStorage.loadSettings();
        setSettings(loaded);
    };

    const saveSettings = async () => {
        if (settings) {
            await ConfigStorage.saveSettings(settings);
            Alert.alert('✅ Sauvegardé', 'Configuration enregistrée avec succès');
        }
    };

    const updateSetting = <K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ) => {
        if (settings) {
            setSettings({ ...settings, [key]: value });
        }
    };

    if (!settings) {
        return (
            <View style={styles.container}>
                <Text style={styles.loading}>Chargement...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>⚙️ Configuration</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Section Vidéos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📹 Gestion des vidéos</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Pack de vidéos</Text>
                        <View style={styles.pickerContainer}>
                            {VIDEO_PACKS.map((pack) => (
                                <TouchableOpacity
                                    key={pack.id}
                                    style={[
                                        styles.pickerButton,
                                        settings.videoPack.id === pack.id && styles.pickerButtonActive,
                                    ]}
                                    onPress={() => updateSetting('videoPack', pack)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerButtonText,
                                            settings.videoPack.id === pack.id && styles.pickerButtonTextActive,
                                        ]}
                                    >
                                        {pack.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Rotation automatique</Text>
                        <Switch
                            value={settings.autoRotate}
                            onValueChange={(val) => updateSetting('autoRotate', val)}
                        />
                    </View>

                    {settings.autoRotate && (
                        <>
                            <View style={styles.setting}>
                                <Text style={styles.label}>Mode de rotation</Text>
                                <Text style={styles.description}>
                                    Aléatoire : choisit une vidéo au hasard à chaque fois{'\n'}
                                    Séquentielle : lit les vidéos dans l'ordre (1, 2, 3...)
                                </Text>
                                <View style={styles.pickerContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.pickerButton,
                                            settings.rotationMode === 'random' && styles.pickerButtonActive,
                                        ]}
                                        onPress={() => updateSetting('rotationMode', 'random')}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerButtonText,
                                                settings.rotationMode === 'random' && styles.pickerButtonTextActive,
                                            ]}
                                        >
                                            Aléatoire
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.pickerButton,
                                            settings.rotationMode === 'sequential' && styles.pickerButtonActive,
                                        ]}
                                        onPress={() => updateSetting('rotationMode', 'sequential')}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerButtonText,
                                                settings.rotationMode === 'sequential' && styles.pickerButtonTextActive,
                                            ]}
                                        >
                                            Séquentielle
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}

                    <View style={styles.setting}>
                        <Text style={styles.label}>Durée de lecture</Text>
                        <View style={styles.pickerContainer}>
                            {(['full', 5, 10, 15, 30] as const).map((duration) => (
                                <TouchableOpacity
                                    key={duration}
                                    style={[
                                        styles.pickerButtonSmall,
                                        settings.playDuration === duration && styles.pickerButtonActive,
                                    ]}
                                    onPress={() => updateSetting('playDuration', duration as 'full' | number)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerButtonText,
                                            settings.playDuration === duration && styles.pickerButtonTextActive,
                                        ]}
                                    >
                                        {duration === 'full' ? 'Complète' : `${duration}s`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Section Liste des Vidéos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎬 Dossier des vidéos</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Chemin du dossier</Text>
                        <Text style={styles.description}>
                            Modifiez le chemin où l'application cherche les vidéos
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={settings.videoPack.folder}
                            onChangeText={(val) =>
                                updateSetting('videoPack', { ...settings.videoPack, folder: val })
                            }
                            placeholder="/data/data/com.rnparryhotterkiosk/files/videos"
                        />

                        <Text style={[styles.description, { marginTop: 12 }]}>Chemins courants :</Text>
                        <View style={styles.quickPathsContainer}>
                            <TouchableOpacity
                                style={styles.quickPathButton}
                                onPress={() =>
                                    updateSetting('videoPack', {
                                        ...settings.videoPack,
                                        folder: '/data/data/com.rnparryhotterkiosk/files/videos',
                                    })
                                }
                            >
                                <Text style={styles.quickPathText}>📁 App/videos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickPathButton}
                                onPress={() =>
                                    updateSetting('videoPack', {
                                        ...settings.videoPack,
                                        folder: '/sdcard/Download',
                                    })
                                }
                            >
                                <Text style={styles.quickPathText}>📥 Download</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickPathButton}
                                onPress={() =>
                                    updateSetting('videoPack', {
                                        ...settings.videoPack,
                                        folder: '/storage/emulated/0/Download',
                                    })
                                }
                            >
                                <Text style={styles.quickPathText}>📥 Download (alt)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickPathButton}
                                onPress={() =>
                                    updateSetting('videoPack', {
                                        ...settings.videoPack,
                                        folder: '/sdcard/Movies',
                                    })
                                }
                            >
                                <Text style={styles.quickPathText}>🎬 Movies</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>🔍 Diagnostic</Text>
                        <Text style={styles.description}>
                            Vérifiez si l'application peut accéder aux vidéos dans ce dossier
                        </Text>
                        <TouchableOpacity
                            style={[styles.importButton, { backgroundColor: '#FF9800' }]}
                            onPress={async () => {
                                try {
                                    const result = await PermissionsModule.listVideosInFolder(
                                        settings.videoPack.folder
                                    );
                                    Alert.alert('📊 Résultat', result);
                                } catch (error: any) {
                                    Alert.alert('❌ Erreur', error.message || String(error));
                                }
                            }}
                        >
                            <Text style={styles.importButtonText}>🔍 Tester l'accès au dossier</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Comment ajouter des vidéos ?</Text>
                        <Text style={styles.description}>
                            Méthode 1 : Copiez vos vidéos dans /sdcard/Download/ puis :
                        </Text>
                        <TouchableOpacity
                            style={styles.importButton}
                            onPress={async () => {
                                try {
                                    const result = await FileImporter.importAllVideosFromDownload();
                                    Alert.alert('✅ Succès', result);
                                } catch (error) {
                                    Alert.alert('❌ Erreur', String(error));
                                }
                            }}
                        >
                            <Text style={styles.importButtonText}>📥 Importer depuis Download</Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.description}>
                                Méthode 2 : Utilisez adb depuis votre ordinateur :
                            </Text>
                        </View>
                        <Text style={styles.emptyCode}>
                            adb push video.mp4 /sdcard/Download/
                        </Text>
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.description}>
                                Puis utilisez le bouton ci-dessus pour importer
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section Détection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎥 Détection de mouvement</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>
                            Sensibilité: {settings.motionSensitivity}
                        </Text>
                        <View style={styles.sliderWithButtons}>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => updateSetting('motionSensitivity', Math.max(0, settings.motionSensitivity - 5))}
                            >
                                <Text style={styles.adjustButtonText}>−</Text>
                            </TouchableOpacity>
                            <Slider
                                style={styles.sliderFlex}
                                minimumValue={0}
                                maximumValue={100}
                                step={5}
                                value={settings.motionSensitivity}
                                onValueChange={(val: number) => updateSetting('motionSensitivity', val)}
                                minimumTrackTintColor="#4A90E2"
                                maximumTrackTintColor="#ddd"
                            />
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => updateSetting('motionSensitivity', Math.min(100, settings.motionSensitivity + 5))}
                            >
                                <Text style={styles.adjustButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>
                            Délai d'inactivité: {settings.inactivityDelay}s
                        </Text>
                        <Text style={styles.description}>
                            Temps d'attente avant de mettre la vidéo en pause si aucun mouvement n'est détecté
                        </Text>
                        <View style={styles.pickerContainer}>
                            {[5, 10, 30, 60, 120].map((delay) => (
                                <TouchableOpacity
                                    key={delay}
                                    style={[
                                        styles.pickerButtonSmall,
                                        settings.inactivityDelay === delay && styles.pickerButtonActive,
                                    ]}
                                    onPress={() => updateSetting('inactivityDelay', delay)}
                                >
                                    <Text
                                        style={[
                                            styles.pickerButtonText,
                                            settings.inactivityDelay === delay && styles.pickerButtonTextActive,
                                        ]}
                                    >
                                        {delay >= 60 ? `${delay / 60}min` : `${delay}s`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Section Programmation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⏰ Programmation horaire</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Activer la programmation</Text>
                        <Switch
                            value={settings.schedule.enabled}
                            onValueChange={(val) =>
                                updateSetting('schedule', { ...settings.schedule, enabled: val })
                            }
                        />
                    </View>

                    {settings.schedule.enabled && (
                        <>
                            <View style={styles.setting}>
                                <Text style={styles.label}>Mise en veille</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.schedule.sleepTime}
                                    onChangeText={(val) =>
                                        updateSetting('schedule', { ...settings.schedule, sleepTime: val })
                                    }
                                    placeholder="HH:mm"
                                />
                            </View>

                            <View style={styles.setting}>
                                <Text style={styles.label}>Réveil</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.schedule.wakeTime}
                                    onChangeText={(val) =>
                                        updateSetting('schedule', { ...settings.schedule, wakeTime: val })
                                    }
                                    placeholder="HH:mm"
                                />
                            </View>

                            <View style={styles.setting}>
                                <Text style={styles.label}>Jours actifs</Text>
                                <View style={styles.daysContainer}>
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.dayButton,
                                                settings.schedule.activeDays[index] && styles.dayButtonActive,
                                            ]}
                                            onPress={() => {
                                                const newDays = [...settings.schedule.activeDays];
                                                newDays[index] = !newDays[index];
                                                updateSetting('schedule', {
                                                    ...settings.schedule,
                                                    activeDays: newDays,
                                                });
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayButtonText,
                                                    settings.schedule.activeDays[index] && styles.dayButtonTextActive,
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Section Affichage */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🖥️ Affichage</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>
                            Luminosité: {settings.brightness === -1 ? 'Auto' : settings.brightness}
                        </Text>
                        <View style={styles.sliderWithButtons}>
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => updateSetting('brightness', Math.max(-1, settings.brightness - 10))}
                            >
                                <Text style={styles.adjustButtonText}>−</Text>
                            </TouchableOpacity>
                            <Slider
                                style={styles.sliderFlex}
                                minimumValue={-1}
                                maximumValue={100}
                                step={1}
                                value={settings.brightness}
                                onValueChange={(val: number) => updateSetting('brightness', Math.round(val))}
                                minimumTrackTintColor="#4A90E2"
                                maximumTrackTintColor="#ddd"
                            />
                            <TouchableOpacity
                                style={styles.adjustButton}
                                onPress={() => updateSetting('brightness', Math.min(100, settings.brightness + 10))}
                            >
                                <Text style={styles.adjustButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Overlay debug</Text>
                        <Switch
                            value={settings.showDebugOverlay}
                            onValueChange={(val) => updateSetting('showDebugOverlay', val)}
                        />
                    </View>
                </View>

                {/* Section Système */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔧 Système & Énergie</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Garder l'écran allumé</Text>
                        <Text style={styles.description}>
                            Empêche l'écran de s'éteindre tant que l'application est ouverte
                        </Text>
                        <Switch
                            value={settings.keepScreenOn}
                            onValueChange={(val) => updateSetting('keepScreenOn', val)}
                        />
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Ignorer optimisations batterie</Text>
                        <Text style={styles.description}>
                            Redirige vers les paramètres système pour autoriser l'application à fonctionner en arrière-plan sans restriction
                        </Text>
                        <TouchableOpacity
                            style={[styles.importButton, { backgroundColor: '#607D8B' }]}
                            onPress={() => {
                                // TODO: Implement linking to battery settings
                                Alert.alert('Info', 'Veuillez désactiver l\'optimisation de batterie pour "MyLittleKiosk" dans les paramètres Android qui vont s\'ouvrir.');
                                // Linking.openSettings(); // Requires import
                            }}
                        >
                            <Text style={styles.importButtonText}>⚙️ Ouvrir paramètres batterie</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Verrouillage kiosk</Text>
                        <Switch
                            value={settings.kioskLocked}
                            onValueChange={(val) => updateSetting('kioskLocked', val)}
                        />
                    </View>

                    {settings.kioskLocked && (
                        <View style={styles.setting}>
                            <Text style={styles.label}>Code PIN</Text>
                            <TextInput
                                style={styles.input}
                                value={settings.kioskPin}
                                onChangeText={(val) => updateSetting('kioskPin', val)}
                                placeholder="1234"
                                keyboardType="numeric"
                                maxLength={6}
                                secureTextEntry
                            />
                        </View>
                    )}

                    <View style={styles.setting}>
                        <Text style={styles.label}>Mode Kiosk Immersif</Text>
                        <Text style={styles.description}>
                            Verrouille l'application à l'écran (Screen Pinning).
                            Empêche l'utilisateur de quitter l'application.
                        </Text>
                        <Switch
                            value={settings.kioskMode}
                            onValueChange={async (val) => {
                                updateSetting('kioskMode', val);
                                if (val) {
                                    try {
                                        await NativeModules.KioskModule.startLockTask();
                                    } catch (e) {
                                        Alert.alert('Erreur', 'Impossible d\'activer le mode Kiosk');
                                    }
                                } else {
                                    try {
                                        await NativeModules.KioskModule.stopLockTask();
                                    } catch (e) {
                                        // Ignore error if not in lock task
                                    }
                                }
                            }}
                        />
                    </View>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Activer les logs</Text>
                        <Switch
                            value={settings.enableLogs}
                            onValueChange={(val) => updateSetting('enableLogs', val)}
                        />
                    </View>
                </View>

                {/* Section Magic Corners */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✨ Magic Corners</Text>
                    <Text style={styles.description}>
                        Configurez des actions invisibles dans les coins de l'écran.
                        (Haut-Gauche est par défaut "Réglages" avec 3 taps)
                    </Text>

                    {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => {
                        const cornerKey = corner as keyof typeof settings.magicCorners;
                        const config = settings.magicCorners[cornerKey];

                        const getLabel = (c: string) => {
                            switch (c) {
                                case 'topLeft': return 'Haut Gauche';
                                case 'topRight': return 'Haut Droite';
                                case 'bottomLeft': return 'Bas Gauche';
                                case 'bottomRight': return 'Bas Droite';
                            }
                        };

                        return (
                            <View key={corner} style={styles.setting}>
                                <Text style={styles.label}>{getLabel(corner)}</Text>
                                <View style={styles.pickerContainer}>
                                    {(['none', 'settings', 'next_video', 'pause_resume', 'open_app'] as MagicCornerAction[]).map((action) => (
                                        <TouchableOpacity
                                            key={action}
                                            style={[
                                                styles.pickerButtonSmall,
                                                config.action === action && styles.pickerButtonActive,
                                            ]}
                                            onPress={() => {
                                                const newCorners = { ...settings.magicCorners };
                                                newCorners[cornerKey] = { ...config, action };
                                                updateSetting('magicCorners', newCorners);
                                            }}
                                        >
                                            <Text style={[
                                                styles.pickerButtonText,
                                                config.action === action && styles.pickerButtonTextActive
                                            ]}>
                                                {action === 'none' ? 'Aucun' :
                                                    action === 'settings' ? 'Réglages' :
                                                        action === 'next_video' ? 'Suivant' :
                                                            action === 'pause_resume' ? 'Pause/Play' : 'Ouvrir App'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {config.action === 'open_app' && (
                                    <TextInput
                                        style={[styles.input, { marginTop: 8 }]}
                                        placeholder="Nom du paquet (ex: io.homeassistant...)"
                                        value={config.payload}
                                        onChangeText={(val) => {
                                            const newCorners = { ...settings.magicCorners };
                                            newCorners[cornerKey] = { ...config, payload: val };
                                            updateSetting('magicCorners', newCorners);
                                        }}
                                    />
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Section MQTT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📡 Smart Home (MQTT)</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Activer MQTT</Text>
                        <Switch
                            value={settings.mqtt.enabled}
                            onValueChange={(val) =>
                                updateSetting('mqtt', { ...settings.mqtt, enabled: val })
                            }
                        />
                    </View>

                    {settings.mqtt.enabled && (
                        <>
                            <View style={styles.setting}>
                                <Text style={styles.label}>Broker URL (WebSockets)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.mqtt.brokerUrl}
                                    onChangeText={(val) =>
                                        updateSetting('mqtt', { ...settings.mqtt, brokerUrl: val })
                                    }
                                    placeholder="ws://192.168.1.x:9001"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.setting}>
                                <Text style={styles.label}>Topic Prefix</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.mqtt.topicPrefix}
                                    onChangeText={(val) =>
                                        updateSetting('mqtt', { ...settings.mqtt, topicPrefix: val })
                                    }
                                    placeholder="mylittlekiosk"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.setting}>
                                <Text style={styles.label}>Username (Optionnel)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.mqtt.username}
                                    onChangeText={(val) =>
                                        updateSetting('mqtt', { ...settings.mqtt, username: val })
                                    }
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.setting}>
                                <Text style={styles.label}>Password (Optionnel)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={settings.mqtt.password}
                                    onChangeText={(val) =>
                                        updateSetting('mqtt', { ...settings.mqtt, password: val })
                                    }
                                    secureTextEntry
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Section Audio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔊 Audio</Text>

                    <View style={styles.setting}>
                        <Text style={styles.label}>Son activé</Text>
                        <Switch
                            value={settings.soundEnabled}
                            onValueChange={(val) => updateSetting('soundEnabled', val)}
                        />
                    </View>

                    {settings.soundEnabled && (
                        <View style={styles.setting}>
                            <Text style={styles.label}>Volume: {settings.volume}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={5}
                                value={settings.volume}
                                onValueChange={(val: number) => updateSetting('volume', val)}
                                minimumTrackTintColor="#4A90E2"
                                maximumTrackTintColor="#ddd"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Boutons d'action */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={async () => {
                        await ConfigStorage.resetSettings();
                        loadSettings();
                        Alert.alert('Reset', 'Configuration réinitialisée');
                    }}
                >
                    <Text style={styles.buttonSecondaryText}>Réinitialiser</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={saveSettings}
                >
                    <Text style={styles.buttonPrimaryText}>Sauvegarder</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loading: {
        flex: 1,
        textAlign: 'center',
        marginTop: 100,
        fontSize: 18,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        fontSize: 28,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    setting: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    description: {
        fontSize: 13,
        color: '#888',
        marginBottom: 12,
        lineHeight: 18,
        fontStyle: 'italic',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderWithButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sliderFlex: {
        flex: 1,
        height: 40,
    },
    adjustButton: {
        width: 50,
        height: 50,
        backgroundColor: '#4A90E2',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    adjustButtonText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pickerButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    pickerButtonSmall: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    pickerButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    pickerButtonText: {
        fontSize: 14,
        color: '#555',
    },
    pickerButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    daysContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    dayButtonText: {
        fontSize: 14,
        color: '#555',
    },
    dayButtonTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#4A90E2',
    },
    buttonPrimaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: '#f0f0f0',
    },
    buttonSecondaryText: {
        color: '#555',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    refreshButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#4A90E2',
        borderRadius: 6,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    videoCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    videoList: {
        gap: 8,
    },
    videoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    videoNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#4A90E2',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginRight: 12,
    },
    videoInfo: {
        flex: 1,
    },
    videoName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginBottom: 2,
    },
    videoSize: {
        fontSize: 12,
        color: '#999',
    },
    emptyState: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyHint: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 5,
    },
    emptyCode: {
        fontSize: 11,
        color: '#4A90E2',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    pathText: {
        fontSize: 13,
        color: '#4A90E2',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    importButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    importButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    quickPathsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    quickPathButton: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#4A90E2',
    },
    quickPathText: {
        color: '#4A90E2',
        fontSize: 13,
        fontWeight: '500',
    },
});
