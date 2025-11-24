import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
} from 'react-native';

interface PinPromptProps {
    visible: boolean;
    correctPin: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const PinPrompt: React.FC<PinPromptProps> = ({
    visible,
    correctPin,
    onSuccess,
    onCancel,
}) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (visible) {
            setPin('');
            setError(false);
        }
    }, [visible]);

    const handlePress = (num: string) => {
        if (pin.length < 6) {
            const newPin = pin + num;
            setPin(newPin);
            setError(false);

            // Auto-submit if length matches
            if (newPin.length === correctPin.length) {
                if (newPin === correctPin) {
                    setTimeout(() => onSuccess(), 100);
                } else {
                    setError(true);
                    setTimeout(() => setPin(''), 500);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(false);
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Code PIN requis</Text>

                    <View style={styles.dotsContainer}>
                        {[...Array(correctPin.length || 4)].map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i < pin.length && styles.dotFilled,
                                    error && styles.dotError,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.keypad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <TouchableOpacity
                                key={num}
                                style={styles.key}
                                onPress={() => handlePress(num.toString())}
                            >
                                <Text style={styles.keyText}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.key} onPress={onCancel}>
                            <Text style={styles.cancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.key}
                            onPress={() => handlePress('0')}
                        >
                            <Text style={styles.keyText}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.key} onPress={handleDelete}>
                            <Text style={styles.keyText}>⌫</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: 300,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        marginBottom: 30,
        fontWeight: 'bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        gap: 15,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fff',
    },
    dotFilled: {
        backgroundColor: '#fff',
    },
    dotError: {
        borderColor: '#ff4444',
        backgroundColor: '#ff4444',
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    cancelText: {
        color: '#aaa',
        fontSize: 12,
    },
});
