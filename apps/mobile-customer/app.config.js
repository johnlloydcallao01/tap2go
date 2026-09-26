/**
 * Dynamic Expo config — wraps app.json and injects secrets that cannot live
 * in static JSON. In particular, android.config.googleMaps.apiKey must be a
 * real key at prebuild time: the "{{ env.VAR }}" placeholder syntax is NOT
 * interpolated by Expo, so a literal placeholder ends up in
 * AndroidManifest.xml and Google returns no map tiles (black map + marker).
 *
 * Requires EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local (local) or as an
 * EAS environment secret (cloud builds).
 */
const appJson = require('./app.json');

module.exports = function ({ config }) {
  const base = { ...(config ?? {}), ...(appJson.expo ?? {}) };

  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleMapsApiKey) {
    console.warn(
      '[app.config] EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set — ' +
        'Android map tiles will not load (black map).'
    );
  }

  return {
    ...base,
    android: {
      ...(base.android ?? {}),
      config: {
        ...((base.android ?? {}).config ?? {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
  };
};
