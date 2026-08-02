const PRODUCTION_ORIGIN = 'https://gnostica.io.vn';
const MOBILE_OAUTH_REDIRECT_URI = process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI || 'gnostica://auth/callback';

const configuredEnvironment = (
  process.env.EXPO_PUBLIC_APP_ENV
  || (process.env.EXPO_PUBLIC_APP_URL ? 'production' : 'development')
).trim().toLowerCase();

function getDevelopmentOrigin() {
  const host = process.env.EXPO_PUBLIC_DEV_API_HOST?.trim();

  if (!host) {
    throw new Error('EXPO_PUBLIC_DEV_API_HOST is required when EXPO_PUBLIC_APP_ENV=development. Set it to this computer\'s LAN IP address.');
  }

  if (host.includes('://') || host.includes('/') || host.includes(':')) {
    throw new Error('EXPO_PUBLIC_DEV_API_HOST must contain only a LAN IP address, for example: 192.168.1.10');
  }

  return `http://${host}:8080`;
}

const ENVIRONMENTS = {
  development: {
    apiOrigin: getDevelopmentOrigin,
    // Google redirects must use the public Tunnel origin so the phone browser can
    // receive Google's callback and return to the gnostica:// deep link.
    oauthApiOrigin: PRODUCTION_ORIGIN,
  },
  production: {
    apiOrigin: () => PRODUCTION_ORIGIN,
    oauthApiOrigin: PRODUCTION_ORIGIN,
  },
};

const selectedEnvironment = ENVIRONMENTS[configuredEnvironment];

if (!selectedEnvironment) {
  throw new Error(`EXPO_PUBLIC_APP_ENV must be development or production. Received: ${configuredEnvironment}`);
}

export const APP_ENV = configuredEnvironment;
export const API_ORIGIN = selectedEnvironment.apiOrigin();
export const API_URL = `${API_ORIGIN}/api`;
export const WS_URL = `${API_ORIGIN}/ws`;
export const OAUTH2_URL = `${selectedEnvironment.oauthApiOrigin}/api/oauth2/authorization/google`;
export const OAUTH_REDIRECT_URI = MOBILE_OAUTH_REDIRECT_URI;

// Bunny validates the origin that embeds its player. Keep it configurable so a
// LAN development build can use the same Vite host as the local web app.
const configuredWebOrigin = process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim();
export const WEB_ORIGIN = configuredWebOrigin || (
  configuredEnvironment === 'development'
    ? API_ORIGIN.replace(/:8080$/, ':5173')
    : PRODUCTION_ORIGIN
);
