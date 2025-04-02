import { API_ROUTES } from "@/config/api";
import { axiosInstance } from "@/lib/axios";
import { SongAnalysisResult } from "@/lib/schema";
import { PaginatedResponse } from "@/types/common";
import axios from "axios";

export interface SongCreateRequest {
  artist: string;
  title: string;
}

export interface SongResponse {
  id: string;
  artist: string;
  title: string;
  status: "pending" | "processing" | "completed" | "error";
  message: string | null;
  summary: string | null;
  countries: string[] | null;
  created: string;
  modified: string;
  createdBy: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface SongDetailResponse extends SongResponse {
  lyrics: string | null;
}

export interface SongStatusResponse {
  status: "pending" | "processing" | "completed" | "error";
  message: string;
}

class SongService {
  private baseUrl = `${API_ROUTES.songs.base}`;

  async createSong(data: SongCreateRequest): Promise<SongResponse> {
    try {
      const response = await axiosInstance.post(this.baseUrl, data);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to create song analysis";
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getSongs(page = 1): Promise<PaginatedResponse<SongResponse>> {
    try {
      const response = await axiosInstance.get(this.baseUrl, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to fetch songs";
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getSongById(id: string): Promise<SongDetailResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}${id}/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to fetch song details";
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async getSongStatus(id: string): Promise<SongStatusResponse> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}${id}/status/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to fetch song status";
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async reanalyzeSong(id: string): Promise<SongResponse> {
    try {
      const response = await axiosInstance.post(
        `${this.baseUrl}${id}/reanalyze/`
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Failed to reanalyze song";
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  toAnalysisResult(
    song: SongResponse | SongDetailResponse
  ): SongAnalysisResult {
    return {
      id: song.id,
      artist: song.artist,
      title: song.title,
      summary: song.summary || "",
      countries: song.countries || [],
      status: song.status,
    };
  }
}

export const songService = new SongService();
