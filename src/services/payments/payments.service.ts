import { requestPartner } from "../core/api-client.service";
import type { PartnerPayment } from "./payments.types";

export const paymentsService = {
  getPayments(status?: string) {
    return requestPartner<{ items: PartnerPayment[]; total: number }>(
      `/partner/payments${
        status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""
      }`
    );
  },

  verifyPayment(paymentId: string, slipUrl?: string) {
    return requestPartner<null>(
      `/partner/payments/${encodeURIComponent(paymentId)}/verify`,
      {
        method: "PATCH",
        body: JSON.stringify({ slipUrl }),
      }
    );
  },

  refundPayment(paymentId: string, refundAmount?: number) {
    return requestPartner<null>(
      `/partner/payments/${encodeURIComponent(paymentId)}/refund`,
      {
        method: "PATCH",
        body: JSON.stringify({ refundAmount }),
      }
    );
  },

  settlePayment(paymentId: string) {
    return requestPartner<null>(
      `/partner/payments/${encodeURIComponent(paymentId)}/settle`,
      {
        method: "PATCH",
        body: JSON.stringify({}),
      }
    );
  },
};
