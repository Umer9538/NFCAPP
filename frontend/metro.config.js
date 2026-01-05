const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the database folder to watchFolders so Metro can resolve imports from it
const databasePath = path.resolve(__dirname, '../database');

config.watchFolders = [databasePath];

// Add the database folder to nodeModulesPaths for resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../database'),
];

// Add extra node_modules from the monorepo root if needed
config.resolver.extraNodeModules = {
  '@database': databasePath,
};

module.exports = config;
