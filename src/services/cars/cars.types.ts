export type PartnerCarStatus = "available" | "rented" | "maintenance" | "hidden";

export type PartnerCar = {
  id: string;
  tenantId?: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  description?: string;
  locationId?: string;
  status: PartnerCarStatus;
  isAvailable: boolean;
  image?: string;
  imageUrl?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PartnerCarPayload = {
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  description?: string;
  locationId?: string;
  status: PartnerCarStatus;
};
