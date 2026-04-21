export type PartnerPromotion = {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: "percent" | "amount";
  discountValue: number;
  isActive: boolean;
  createdAt?: string;
};
