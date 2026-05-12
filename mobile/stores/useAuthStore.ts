import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/models";
import { apiAuth } from "../api/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userJson = await AsyncStorage.getItem("user");
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false });
      } else if (token) {
        // Token exists but no user data - clear stale token
        await AsyncStorage.removeItem("access_token");
        set({ isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await apiAuth.login(email, password);
    await AsyncStorage.setItem("access_token", res.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(res.user));
    set({ user: res.user, accessToken: res.access_token, isAuthenticated: true });
  },

  register: async (email, password, name) => {
    const res = await apiAuth.register(email, password, name);
    await AsyncStorage.setItem("access_token", res.access_token);
    await AsyncStorage.setItem("user", JSON.stringify(res.user));
    set({ user: res.user, accessToken: res.access_token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
