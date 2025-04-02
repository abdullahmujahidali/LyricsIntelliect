interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const AUTH_STORAGE_KEY = "auth_tokens";

export const setStoredAuth = (auth: AuthTokens) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const getStoredAuth = (): AuthTokens | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const removeStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
