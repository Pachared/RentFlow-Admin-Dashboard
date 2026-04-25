export type PartnerCarStatus = "available" | "rented" | "maintenance" | "hidden";
export type PartnerCarAvailabilityStatus = PartnerCarStatus | "booked";

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
  unitCount?: number;
  reservedUnits?: number;
  availableUnits?: number;
  description?: string;
  locationId?: string;
  status: PartnerCarStatus;
  availabilityStatus?: PartnerCarAvailabilityStatus;
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
  unitCount: number;
  description?: string;
  locationId?: string;
  status: PartnerCarStatus;
};
