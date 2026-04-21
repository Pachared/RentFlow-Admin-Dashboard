import { requestPartner } from "../core/api-client.service";
import type { AuthUser } from "./auth.types";

export const authService = {
  login(input: { username: string; password: string }) {
    return requestPartner<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  logout() {
    return requestPartner<null>("/auth/logout", {
      method: "POST",
    });
  },
};
