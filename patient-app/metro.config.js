const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// This is the important part to add
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'dayjs/plugin/relativeTime': path.resolve(
    __dirname,
    './node_modules/dayjs/plugin/relativeTime.js'
  ),
};

module.exports = config;