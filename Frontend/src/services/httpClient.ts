import axios from "axios";
import API_URL from "../apiConfig";

// Auth is a bearer token attached per-request, not a cookie. The frontend and backend
// live on different Railway subdomains (different registrable "sites" for cookie
// purposes), so a cross-site session cookie gets silently dropped by browsers with
// third-party cookie blocking enabled. A token attached by our own code has no such
// browser cookie policy to fight.
const TOKEN_STORAGE_KEY = "authToken";

export const getAuthToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const httpClient = axios.create({ baseURL: API_URL });

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(error);
  },
);

export default httpClient;
