export type PartnerPayment = {
  id: string;
  bookingId: string;
  bookingCode?: string;
  customerName?: string;
  method: string;
  status: string;
  amount: number;
  transactionId?: string;
  slipUrl?: string;
  verifiedAt?: string;
  refundStatus?: string;
  refundAmount?: number;
  payoutStatus?: string;
  settledAt?: string;
  createdAt?: string;
};
