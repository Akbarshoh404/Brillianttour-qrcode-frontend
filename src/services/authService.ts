import { api } from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";
import type { CurrentUser, TokenResponse } from "@/types";

export const authService = {
  async login(username: string, password: string): Promise<void> {
    const { data } = await api.post<TokenResponse>("/auth/login", { username, password });
    tokenStorage.set(data.access_token);
  },

  async me(): Promise<CurrentUser> {
    const { data } = await api.get<CurrentUser>("/auth/me");
    return data;
  },

  logout(): void {
    tokenStorage.clear();
  },

  isLoggedIn(): boolean {
    return !!tokenStorage.get();
  },
};
