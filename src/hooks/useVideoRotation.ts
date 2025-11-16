import { useState, useCallback } from 'react';
import { AppSettings } from '../config/settingsModel';

export interface VideoSource {
  uri: string;
}

export const useVideoRotation = (settings: AppSettings | null) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [usedVideos, setUsedVideos] = useState<number[]>([]);

  const getVideoPath = useCallback((index: number): VideoSource => {
    const videoNumber = index + 1;
    const folder = settings?.videoPack.folder ?? '/data/user/0/com.rnparryhotterkiosk/files/videos';
    return {
      uri: `file://${folder}/portrait${videoNumber}.mp4`,
    };
  }, [settings]);

  const getNextVideo = useCallback((): VideoSource => {
    if (!settings || !settings.autoRotate) {
      // Si rotation désactivée, toujours retourner la première vidéo
      return getVideoPath(0);
    }

    const videoCount = settings.videoPack.videoCount;

    if (videoCount === 0) {
      return getVideoPath(0);
    }

    let nextIndex: number;

    if (settings.rotationMode === 'random') {
      // Mode aléatoire avec mémoire (éviter répétition immédiate)
      const availableIndexes = Array.from({ length: videoCount }, (_, i) => i)
        .filter(i => !usedVideos.includes(i));

      if (availableIndexes.length === 0) {
        // Tout a été utilisé, reset
        setUsedVideos([]);
        nextIndex = Math.floor(Math.random() * videoCount);
      } else {
        nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      }

      setUsedVideos(prev => [...prev, nextIndex]);

      // Si on a utilisé plus de la moitié, commencer à oublier les anciens
      setUsedVideos(prev => prev.length > videoCount / 2 ? prev.slice(1) : prev);

    } else {
      // Mode séquentiel
      nextIndex = (currentVideoIndex + 1) % videoCount;
    }

    setCurrentVideoIndex(nextIndex);
    return getVideoPath(nextIndex);
  }, [settings, currentVideoIndex, usedVideos, getVideoPath]);

  const getCurrentVideo = useCallback((): VideoSource => {
    return getVideoPath(currentVideoIndex);
  }, [currentVideoIndex, getVideoPath]);

  return {
    getCurrentVideo,
    getNextVideo,
    currentVideoIndex,
  };
};
