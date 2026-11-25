const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');
const syncEnv = require('./scripts/sync-env');

// Run dynamic .env sync immediately when Metro bundler starts
syncEnv();

// Watch .env for changes during development so changing .env immediately updates env.json
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.watchFile(envPath, { interval: 1000 }, () => {
    syncEnv();
  });
}

const config = getDefaultConfig(__dirname);

module.exports = config;
