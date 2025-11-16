import React, {useRef, useEffect} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Video from 'react-native-video';

const {width, height} = Dimensions.get('window');

interface VideoPlayerProps {
  videoSource: string | {uri: string};
  isActive: boolean;
  onEnd?: () => void;
  playKey?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSource,
  isActive,
  onEnd,
}) => {
  const videoRef = useRef<any>(null);
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    // Si la vidéo passe de inactive à active, la remettre au début
    if (!wasActiveRef.current && isActive && videoRef.current) {
      videoRef.current.seek(0);
    }
    wasActiveRef.current = isActive;
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={
          typeof videoSource === 'string' ? {uri: videoSource} : videoSource
        }
        style={styles.video}
        repeat={false}
        resizeMode="cover"
        paused={!isActive}
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        onEnd={onEnd}
        onError={(error) => console.log('Video Error:', error)}
        onLoad={() => console.log('Video Loaded')}
        onLoadStart={() => console.log('Video Loading...')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
});
