import { API_ROUTES } from "@/config/api";
import axios from "axios";
import { getStoredAuth, removeStoredAuth, setStoredAuth } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const auth = getStoredAuth();

      if (!auth?.refreshToken) {
        removeStoredAuth();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      const response = await axios.post(
        `${BASE_URL}${API_ROUTES.auth.refresh}`,
        {
          refresh: auth.refreshToken,
        }
      );

      const { access: newAccessToken, refresh: newRefreshToken } =
        response.data;

      setStoredAuth({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || auth.refreshToken,
      });
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (
        axios.isAxiosError(refreshError) &&
        (refreshError.response?.status === 401 ||
          refreshError.response?.data?.code === "token_not_valid")
      ) {
        removeStoredAuth();
        window.location.href = "/auth/login";
      }
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
