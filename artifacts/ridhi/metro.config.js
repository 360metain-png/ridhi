const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude pnpm temp directories from Metro's watcher to prevent ENOSPC/ENOENT errors
config.resolver.blockList = [
  /node_modules\/\.pnpm\/.*\/node_modules\/expo_tmp/,
  /node_modules\/\.pnpm\/.*\/node_modules\/.*_tmp/,
];

module.exports = config;
