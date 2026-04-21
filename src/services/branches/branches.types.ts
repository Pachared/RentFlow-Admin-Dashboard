export type PartnerBranch = {
  id: string;
  tenantId?: string;
  name: string;
  address: string;
  phone?: string;
  locationId?: string;
  type?: "airport" | "storefront" | "meeting_point";
  displayOrder: number;
  lat?: number;
  lng?: number;
  openTime?: string;
  closeTime?: string;
  pickupAvailable: boolean;
  returnAvailable: boolean;
  extraFee: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerBranchPayload = {
  name: string;
  address: string;
  phone?: string;
  locationId?: string;
  type: "airport" | "storefront" | "meeting_point";
  displayOrder: number;
  lat?: number;
  lng?: number;
  openTime?: string;
  closeTime?: string;
  pickupAvailable: boolean;
  returnAvailable: boolean;
  extraFee: number;
  isActive: boolean;
};
