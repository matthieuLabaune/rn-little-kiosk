import { NativeModules } from 'react-native';

interface VideoInfo {
  name: string;
  path: string;
  uri: string;
  size: number;
}

interface VideoScannerModule {
  scanVideos(folderPath: string): Promise<VideoInfo[]>;
  getDefaultVideoFolder(): Promise<string>;
  createVideoFolder(): Promise<string>;
}

const { VideoScanner } = NativeModules as { VideoScanner: VideoScannerModule };

export const useVideoScanner = () => {
  const scanVideos = async (folderPath?: string): Promise<VideoInfo[]> => {
    try {
      const folder = folderPath || await VideoScanner.getDefaultVideoFolder();
      const videos = await VideoScanner.scanVideos(folder);
      return videos;
    } catch (error) {
      console.error('Erreur scan vidéos:', error);
      return [];
    }
  };

  const getDefaultFolder = async (): Promise<string> => {
    return VideoScanner.getDefaultVideoFolder();
  };

  const createFolder = async (): Promise<string> => {
    return VideoScanner.createVideoFolder();
  };

  return {
    scanVideos,
    getDefaultFolder,
    createFolder,
  };
};

export type { VideoInfo };
