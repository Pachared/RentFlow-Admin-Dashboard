import { requestPartner } from "../core/api-client.service";
import type { PartnerTenant } from "./tenant.types";

export const tenantService = {
  getMyTenant() {
    return requestPartner<PartnerTenant>("/tenants/me");
  },

  saveMyTenant(input: { shopName: string; domainSlug: string }) {
    return requestPartner<PartnerTenant>("/tenants/me", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
