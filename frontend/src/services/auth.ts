/* eslint-disable @typescript-eslint/no-unused-vars */
import { API_ROUTES } from "@/config/api";
import { axiosInstance } from "@/lib/axios";
import { AuthTokens, LoginData, RegisterData } from "@/types/auth";
import axios from "axios";

interface ErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
  code?: string;
}

class AuthService {
  async register(data: RegisterData) {
    try {
      const response = await axiosInstance.post(API_ROUTES.users.base, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.detail || errorData.message || "Registration failed"
        );
      }
      throw new Error("Registration failed");
    }
  }

  async login(data: LoginData): Promise<AuthTokens> {
    try {
      const response = await axiosInstance.post(API_ROUTES.auth.login, {
        email: data.email,
        password: data.password,
      });

      return {
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        if (
          errorData.detail ===
          "Your account has been deactivated. Please contact an administrator."
        ) {
          throw new Error(
            "Your account has been deactivated. Please contact an administrator."
          );
        }
        if (
          errorData.detail ===
          "No active account found with the given credentials"
        ) {
          throw new Error("Invalid email or password");
        }
        throw new Error(
          errorData.detail || errorData.message || "Login failed"
        );
      }
      throw new Error("Login failed");
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ access: string; refresh?: string }> {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${API_ROUTES.auth.refresh}`,
        {
          refresh: refreshToken,
        }
      );

      return {
        access: response.data.access,
        refresh: response.data.refresh,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ErrorResponse;
        throw new Error(
          errorData.detail || errorData.message || "Token refresh failed"
        );
      }
      throw new Error("Token refresh failed");
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await axiosInstance.post(API_ROUTES.auth.verify, { token });
      return true;
    } catch (_) {
      return false;
    }
  }

  async logout(): Promise<void> {
    // Need to write cleanup logic here but due to time constraint i am skipping it
    // For example, blacklisting tokens on the server
  }
}

export const authService = new AuthService();
