import React, { useRef } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Alert, NativeModules } from 'react-native';
import { MagicCornerConfig } from '../config/settingsModel';

interface MagicCornerProps {
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    config: MagicCornerConfig;
    onAction: (action: string) => void;
}

export const MagicCorner: React.FC<MagicCornerProps> = ({ position, config, onAction }) => {
    const tapCountRef = useRef(0);
    const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTap = () => {
        if (config.action === 'none') return;

        tapCountRef.current += 1;

        if (tapCountRef.current === 1) {
            tapTimerRef.current = setTimeout(() => {
                tapCountRef.current = 0;
            }, 500); // Reset after 500ms
        }

        // Settings always requires 3 taps for safety
        const requiredTaps = config.action === 'settings' ? 3 : 1;

        if (tapCountRef.current === requiredTaps) {
            tapCountRef.current = 0;
            if (tapTimerRef.current) {
                clearTimeout(tapTimerRef.current);
            }
            executeAction();
        }
    };

    const executeAction = async () => {
        switch (config.action) {
            case 'open_app':
                if (config.payload) {
                    try {
                        await NativeModules.KioskModule.launchApp(config.payload);
                    } catch (e) {
                        Alert.alert('Erreur', `Impossible d'ouvrir l'application: ${config.payload}`);
                    }
                }
                break;
            default:
                onAction(config.action);
                break;
        }
    };

    const getPositionStyle = () => {
        switch (position) {
            case 'topLeft': return { top: 0, left: 0 };
            case 'topRight': return { top: 0, right: 0 };
            case 'bottomLeft': return { bottom: 0, left: 0 };
            case 'bottomRight': return { bottom: 0, right: 0 };
        }
    };

    return (
        <TouchableWithoutFeedback onPress={handleTap}>
            <View style={[styles.corner, getPositionStyle()]} />
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    corner: {
        position: 'absolute',
        width: 100,
        height: 100,
        zIndex: 9999, // Always on top
        // backgroundColor: 'rgba(255, 0, 0, 0.2)', // Uncomment for debug
    },
});
