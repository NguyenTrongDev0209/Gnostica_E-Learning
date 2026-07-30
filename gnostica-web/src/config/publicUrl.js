const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

// Change this single variable in .env for a different public deployment URL.
const configuredPublicUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();

export const PUBLIC_APP_URL = configuredPublicUrl
  ? trimTrailingSlash(configuredPublicUrl)
  : 'http://localhost:8080';

export const API_URL = `${PUBLIC_APP_URL}/api`;
export const WS_URL = `${PUBLIC_APP_URL}/ws`;
export const OAUTH2_URL = `${API_URL}/oauth2/authorization/google`;
