const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      zlib: false,
      path: false,
      crypto: "crypto-browserify",
      stream: "readable-stream",
    },
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};
