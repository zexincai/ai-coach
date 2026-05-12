import client from "./client";
import { User } from "../types/models";

export const apiUsers = {
  updatePreferences: async (preferences: User["preferences"]): Promise<User> => {
    const { data } = await client.patch("/users/me/preferences", preferences);
    return data;
  },
};
