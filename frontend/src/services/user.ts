import { API_ROUTES } from "@/config/api";
import { axiosInstance } from "@/lib/axios";
import { User as UserType } from "@/types/user";
import axios from "axios";

class UserService {
  async getCurrentUser(): Promise<UserType> {
    try {
      const response = await axiosInstance.get(API_ROUTES.users.me);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || "Failed to fetch user data"
        );
      }
      throw error;
    }
  }
}

export const userService = new UserService();
