import { requestPartner } from "../core/api-client.service";
import type { PartnerDomain } from "./domains.types";

export const domainsService = {
  listDomains() {
    return requestPartner<{ items: PartnerDomain[]; total: number }>(
      "/partner/domains"
    );
  },

  createDomain(domain: string) {
    return requestPartner<PartnerDomain>("/partner/domains", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  },

  verifyDomain(id: string) {
    return requestPartner<null>(
      `/partner/domains/${encodeURIComponent(id)}/verify`,
      {
        method: "PATCH",
        body: JSON.stringify({}),
      }
    );
  },

  deleteDomain(id: string) {
    return requestPartner<null>(`/partner/domains/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
