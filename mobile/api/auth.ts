import client from "./client";
import { User } from "../types/models";

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const apiAuth = {
  register: async (email: string, password: string, name: string): Promise<TokenResponse> => {
    const { data } = await client.post("/auth/register", { email, password, name });
    return data;
  },
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await client.post("/auth/login", { email, password });
    return data;
  },
};
