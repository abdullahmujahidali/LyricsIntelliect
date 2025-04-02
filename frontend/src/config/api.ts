const API_VERSION = "v1";
const BASE_PATH = `/api/${API_VERSION}`;

export const API_ROUTES = {
  auth: {
    login: `${BASE_PATH}/token/`,
    refresh: `${BASE_PATH}/token/refresh/`,
    verify: `${BASE_PATH}/token/verify/`,
  },
  users: {
    base: `${BASE_PATH}/users/`,
    me: `${BASE_PATH}/users/me/`,
    byId: (id: string) => `${BASE_PATH}/users/${id}/`,
  },
  songs: {
    base: `${BASE_PATH}/songs/`,
    byId: (id: string) => `${BASE_PATH}/songs/${id}/`,
    status: (id: string) => `${BASE_PATH}/songs${id}/status/`,
    reanalyze: (id: string) => `${BASE_PATH}/songs${id}/reanalyze/`,
  },
};

export const constructUrl = (
  baseUrl: string,
  params?: Record<string, string | number | boolean>
): string => {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${baseUrl}?${searchParams.toString()}`;
};

export type ApiRoutes = typeof API_ROUTES;
export type ApiEndpoint = keyof ApiRoutes;
