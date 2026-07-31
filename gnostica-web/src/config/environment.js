const ENVIRONMENTS = Object.freeze({
  development: {
    webOrigin: 'http://localhost:5173',
    apiUrl: 'http://localhost:8080/api',
    webSocketUrl: 'http://localhost:8080/ws',
  },
  production: {
    webOrigin: 'https://gnostica.io.vn',
    apiUrl: 'https://gnostica.io.vn/api',
    webSocketUrl: 'https://gnostica.io.vn/ws',
  },
});

const configuredEnvironment = import.meta.env.VITE_APP_ENV?.trim().toLowerCase() || 'development';
const selectedEnvironment = ENVIRONMENTS[configuredEnvironment];

if (!selectedEnvironment) {
  throw new Error(
    `VITE_APP_ENV must be one of: ${Object.keys(ENVIRONMENTS).join(', ')}. Received: ${configuredEnvironment}`,
  );
}

export const APP_ENV = configuredEnvironment;
export const WEB_ORIGIN = selectedEnvironment.webOrigin;
export const API_URL = selectedEnvironment.apiUrl;
export const WS_URL = selectedEnvironment.webSocketUrl;
export const OAUTH2_URL = `${API_URL}/oauth2/authorization/google`;

export const appEnvironment = Object.freeze({
  name: APP_ENV,
  webOrigin: WEB_ORIGIN,
  apiUrl: API_URL,
  webSocketUrl: WS_URL,
  oauth2Url: OAUTH2_URL,
});
