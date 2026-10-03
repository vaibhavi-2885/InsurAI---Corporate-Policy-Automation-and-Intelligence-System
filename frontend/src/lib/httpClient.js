import axios from 'axios';
import { getApiBase } from './api';

const API_BASE = getApiBase();
const LEGACY_LOCAL_API = /^https?:\/\/(?:localhost|127\.0\.0\.1):808[01](\/.*)?$/i;

axios.defaults.baseURL = API_BASE;

// Preserve compatibility with older saved builds while all active screens use
// relative API paths resolved through the environment-aware base URL above.
axios.interceptors.request.use((config) => {
  if (typeof config.url !== 'string') {
    return config;
  }

  const legacyPath = config.url.match(LEGACY_LOCAL_API)?.[1];
  if (legacyPath !== undefined) {
    config.url = `${API_BASE}${legacyPath}`;
  }

  return config;
});

export default axios;
