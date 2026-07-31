const appJson = require('./app.json');

const appEnvironment = (
  process.env.EXPO_PUBLIC_APP_ENV
  || (process.env.EXPO_PUBLIC_APP_URL ? 'production' : 'development')
).trim().toLowerCase();

module.exports = {
  ...appJson.expo,
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
