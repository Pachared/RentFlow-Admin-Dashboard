import type { PartnerBooking } from "../bookings/bookings.types";

export type PartnerAvailabilityBlock = {
  id: string;
  carId?: string;
  branchId?: string;
  startDate: string;
  endDate: string;
  blockType?: string;
  bufferHours?: number;
  reason: string;
  note?: string;
};

export type CreatePartnerAvailabilityBlockInput = Omit<
  PartnerAvailabilityBlock,
  "id"
>;

export type PartnerCalendar = {
  bookings: PartnerBooking[];
  blocks: PartnerAvailabilityBlock[];
};
