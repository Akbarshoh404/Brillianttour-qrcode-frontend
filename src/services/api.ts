import axios, { type AxiosError } from "axios";

import { tokenStorage } from "@/services/tokenStorage";
import type { ApiErrorShape } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Fail loudly in dev rather than silently hitting a relative path.
  // eslint-disable-next-line no-console
  console.error("VITE_API_URL is not set. Create frontend/.env from .env.example.");
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginRequest) {
      tokenStorage.clear();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorShape>;
  return axiosError?.response?.data?.detail ?? "Something went wrong. Please try again.";
}

export { API_URL };
