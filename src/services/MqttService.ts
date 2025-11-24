import mqtt, { MqttClient } from 'mqtt';
import { MqttConfig } from '../config/settingsModel';

// Polyfill for Buffer needed by mqtt.js in React Native
global.Buffer = require('buffer').Buffer;

type CommandHandler = (command: string) => void;

class MqttService {
    private client: MqttClient | null = null;
    private config: MqttConfig | null = null;
    private commandHandler: CommandHandler | null = null;

    connect(config: MqttConfig) {
        if (this.client) {
            this.disconnect();
        }

        this.config = config;

        if (!config.enabled || !config.brokerUrl) {
            return;
        }

        console.log('[MQTT] Connecting to', config.brokerUrl);

        const options: mqtt.IClientOptions = {
            clientId: 'mylittlekiosk_' + Math.random().toString(16).substr(2, 8),
            username: config.username,
            password: config.password,
            clean: true,
            reconnectPeriod: 5000,
        };

        try {
            this.client = mqtt.connect(config.brokerUrl, options);

            this.client.on('connect', () => {
                console.log('[MQTT] Connected');
                this.publish('status', 'online');

                // Subscribe to commands
                const commandTopic = `${config.topicPrefix}/command`;
                this.client?.subscribe(commandTopic, (err) => {
                    if (err) {
                        console.error('[MQTT] Subscribe error', err);
                    } else {
                        console.log('[MQTT] Subscribed to', commandTopic);
                    }
                });
            });

            this.client.on('message', (topic, message) => {
                const msgString = message.toString();
                console.log('[MQTT] Received', topic, msgString);

                if (topic.endsWith('/command') && this.commandHandler) {
                    this.commandHandler(msgString);
                }
            });

            this.client.on('error', (err) => {
                console.error('[MQTT] Error', err);
            });

            this.client.on('offline', () => {
                console.log('[MQTT] Offline');
            });

        } catch (e) {
            console.error('[MQTT] Connection failed', e);
        }
    }

    disconnect() {
        if (this.client) {
            try {
                this.publish('status', 'offline');
                this.client.end();
            } catch (e) {
                console.error('[MQTT] Disconnect error', e);
            }
            this.client = null;
        }
    }

    publish(subtopic: string, message: string) {
        if (this.client && this.client.connected && this.config) {
            const topic = `${this.config.topicPrefix}/${subtopic}`;
            this.client.publish(topic, message);
        }
    }

    setCommandHandler(handler: CommandHandler) {
        this.commandHandler = handler;
    }
}

export const mqttService = new MqttService();
