import { requestPartner } from "../core/api-client.service";
import type { PartnerLead } from "./leads.types";

export const leadsService = {
  listLeads() {
    return requestPartner<{ items: PartnerLead[]; total: number }>(
      "/partner/leads"
    );
  },

  createLead(input: Omit<PartnerLead, "id" | "createdAt">) {
    return requestPartner<PartnerLead>("/partner/leads", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateLead(id: string, input: Omit<PartnerLead, "id" | "createdAt">) {
    return requestPartner<PartnerLead>(
      `/partner/leads/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },

  deleteLead(id: string) {
    return requestPartner<null>(`/partner/leads/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
