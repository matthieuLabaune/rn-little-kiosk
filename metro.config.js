const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['mp4', 'mp3', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
