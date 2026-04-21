import { requestPartner } from "../core/api-client.service";
import type { PartnerPromotion } from "./promotions.types";

export const promotionsService = {
  listPromotions() {
    return requestPartner<{ items: PartnerPromotion[]; total: number }>(
      "/partner/promotions"
    );
  },

  createPromotion(input: Omit<PartnerPromotion, "id" | "createdAt">) {
    return requestPartner<PartnerPromotion>("/partner/promotions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updatePromotion(
    id: string,
    input: Omit<PartnerPromotion, "id" | "createdAt">
  ) {
    return requestPartner<PartnerPromotion>(
      `/partner/promotions/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },

  deletePromotion(id: string) {
    return requestPartner<null>(`/partner/promotions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
