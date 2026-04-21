import type { PartnerBooking } from "../bookings/bookings.types";

export type PartnerAvailabilityBlock = {
  id: string;
  carId?: string;
  branchId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  note?: string;
};

export type PartnerCalendar = {
  bookings: PartnerBooking[];
  blocks: PartnerAvailabilityBlock[];
};
