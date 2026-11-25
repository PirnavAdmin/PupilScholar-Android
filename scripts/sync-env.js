const fs = require('fs');
const path = require('path');

/**
 * Dynamically synchronizes variables from .env into:
 * 1. src/api/env.json (directly imported by React Native bundle)
 * 2. .env EXPO_PUBLIC_* variables (for Expo Metro compiler inlining)
 */
function syncEnv() {
  const rootDir = path.resolve(__dirname, '..');
  const envPath = path.join(rootDir, '.env');
  const targetJsonPath = path.join(rootDir, 'src', 'api', 'env.json');

  if (!fs.existsSync(envPath)) {
    console.log('[sync-env] No .env file found at', envPath);
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const envObj = {};
  let modifiedEnv = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      envObj[key] = val;
    }
  });

  // Ensure EXPO_PUBLIC_ mirrors exist for Expo native bundling
  const apiUrl = envObj.VITE_API_URL || envObj.VITE_BACKEND_TARGET || envObj.API_URL || envObj.EXPO_PUBLIC_API_URL || '';
  const backendTarget = envObj.VITE_BACKEND_TARGET || envObj.VITE_API_URL || envObj.EXPO_PUBLIC_BACKEND_TARGET || '';

  if (apiUrl) {
    if (envObj.EXPO_PUBLIC_API_URL !== apiUrl) {
      envObj.EXPO_PUBLIC_API_URL = apiUrl;
      modifiedEnv = true;
    }
  }

  if (backendTarget) {
    if (envObj.EXPO_PUBLIC_BACKEND_TARGET !== backendTarget) {
      envObj.EXPO_PUBLIC_BACKEND_TARGET = backendTarget;
      modifiedEnv = true;
    }
  }

  // Update src/api/env.json
  try {
    fs.mkdirSync(path.dirname(targetJsonPath), { recursive: true });
    fs.writeFileSync(targetJsonPath, JSON.stringify(envObj, null, 2), 'utf8');
    console.log('[sync-env] Successfully updated src/api/env.json from .env');
    console.log('[sync-env] Active API URL:', apiUrl);
  } catch (err) {
    console.error('[sync-env] Error writing src/api/env.json:', err.message);
  }

  // If new EXPO_PUBLIC_* keys were needed, append them cleanly to .env
  if (modifiedEnv) {
    try {
      const updatedLines = [];
      const keysSeen = new Set();
      lines.forEach((l) => {
        const trimmed = l.trim();
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          keysSeen.add(k);
          if (k === 'EXPO_PUBLIC_API_URL') {
            updatedLines.push(`EXPO_PUBLIC_API_URL=${envObj.EXPO_PUBLIC_API_URL}`);
          } else if (k === 'EXPO_PUBLIC_BACKEND_TARGET') {
            updatedLines.push(`EXPO_PUBLIC_BACKEND_TARGET=${envObj.EXPO_PUBLIC_BACKEND_TARGET}`);
          } else {
            updatedLines.push(l);
          }
        } else {
          updatedLines.push(l);
        }
      });

      if (!keysSeen.has('EXPO_PUBLIC_API_URL') && envObj.EXPO_PUBLIC_API_URL) {
        updatedLines.push(`EXPO_PUBLIC_API_URL=${envObj.EXPO_PUBLIC_API_URL}`);
      }
      if (!keysSeen.has('EXPO_PUBLIC_BACKEND_TARGET') && envObj.EXPO_PUBLIC_BACKEND_TARGET) {
        updatedLines.push(`EXPO_PUBLIC_BACKEND_TARGET=${envObj.EXPO_PUBLIC_BACKEND_TARGET}`);
      }

      fs.writeFileSync(envPath, updatedLines.join('\n').trim() + '\n', 'utf8');
    } catch (err) {
      // Ignore if write restricted
    }
  }
}

if (require.main === module) {
  syncEnv();
}

module.exports = syncEnv;
