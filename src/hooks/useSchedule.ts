import { useState, useEffect } from 'react';
import { ScheduleConfig } from '../config/settingsModel';

export function useSchedule(scheduleConfig: ScheduleConfig) {
    const [isSleepMode, setIsSleepMode] = useState(false);

    useEffect(() => {
        if (!scheduleConfig.enabled) {
            setIsSleepMode(false);
            return;
        }

        const checkSchedule = () => {
            const now = new Date();
            const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi...

            // Convertir Dimanche (0) en index 6 pour notre tableau [Lun, Mar, ..., Dim]
            // Lundi (1) -> 0
            const dayIndex = currentDay === 0 ? 6 : currentDay - 1;

            // Vérifier si le jour est actif
            if (!scheduleConfig.activeDays[dayIndex]) {
                // Si le jour n'est pas actif, on considère qu'on est en veille ?
                // Ou on reste allumé ?
                // Convention: Si jour inactif = pas de kiosk = écran éteint (veille)
                setIsSleepMode(true);
                return;
            }

            const currentTime = now.getHours() * 60 + now.getMinutes();

            const [sleepHour, sleepMinute] = scheduleConfig.sleepTime.split(':').map(Number);
            const sleepTime = sleepHour * 60 + sleepMinute;

            const [wakeHour, wakeMinute] = scheduleConfig.wakeTime.split(':').map(Number);
            const wakeTime = wakeHour * 60 + wakeMinute;

            // Cas simple: Réveil 08:00, Veille 22:00
            if (wakeTime < sleepTime) {
                if (currentTime >= wakeTime && currentTime < sleepTime) {
                    setIsSleepMode(false); // Actif
                } else {
                    setIsSleepMode(true); // Veille
                }
            }
            // Cas nuit: Réveil 08:00, Veille 01:00 (le lendemain)
            // Non géré parfaitement ici pour l'instant, on assume que sleepTime > wakeTime pour la journée
            // Si sleepTime < wakeTime (ex: veille 01:00, reveil 08:00), c'est inversé
            else {
                if (currentTime >= wakeTime || currentTime < sleepTime) {
                    setIsSleepMode(false);
                } else {
                    setIsSleepMode(true);
                }
            }
        };

        // Vérifier immédiatement
        checkSchedule();

        // Vérifier chaque minute
        const interval = setInterval(checkSchedule, 60000);

        return () => clearInterval(interval);
    }, [scheduleConfig]);

    return isSleepMode;
}
