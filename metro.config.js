const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ses dosyalarını bundle'a dahil et
config.resolver.assetExts.push('mp3', 'wav', 'aiff');

module.exports = config;
