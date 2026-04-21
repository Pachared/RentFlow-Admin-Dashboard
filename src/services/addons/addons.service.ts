import { requestPartner } from "../core/api-client.service";
import type { PartnerAddon } from "./addons.types";

export const addonsService = {
  listAddons() {
    return requestPartner<{ items: PartnerAddon[]; total: number }>(
      "/partner/addons"
    );
  },

  createAddon(input: Omit<PartnerAddon, "id" | "createdAt">) {
    return requestPartner<PartnerAddon>("/partner/addons", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateAddon(id: string, input: Omit<PartnerAddon, "id" | "createdAt">) {
    return requestPartner<PartnerAddon>(
      `/partner/addons/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },

  deleteAddon(id: string) {
    return requestPartner<null>(`/partner/addons/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
