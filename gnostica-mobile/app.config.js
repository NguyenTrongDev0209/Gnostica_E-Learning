const appJson = require('./app.json');

const appEnvironment = (
  process.env.EXPO_PUBLIC_APP_ENV
  || (process.env.EXPO_PUBLIC_APP_URL ? 'production' : 'development')
).trim().toLowerCase();

module.exports = {
  ...appJson.expo,
  updates: {
    ...(appJson.expo.updates || {}),
    url: 'https://u.expo.dev/8cc6a315-8bee-49a6-abb4-7396386bd420',
    fallbackToCacheTimeout: 30000,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  extra: {
    ...(appJson.expo.extra || {}),
    eas: {
      projectId: '8cc6a315-8bee-49a6-abb4-7396386bd420',
    },
  },
  plugins: [
    ...(appJson.expo.plugins || []),
    [
      'expo-build-properties',
      {
        android: {
          // LAN development uses http://<IP>:8080. Production uses HTTPS only.
          usesCleartextTraffic: appEnvironment === 'development',
        },
      },
    ],
  ],
};
