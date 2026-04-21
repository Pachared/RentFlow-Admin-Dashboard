import { requestPartner } from "../core/api-client.service";
import type { PartnerBooking } from "./bookings.types";

export const bookingsService = {
  getBookings(status?: string) {
    return requestPartner<{ items: PartnerBooking[]; total: number }>(
      `/partner/bookings${
        status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""
      }`
    );
  },

  updateBookingStatus(bookingId: string, status: string, note?: string) {
    return requestPartner<PartnerBooking>(
      `/partner/bookings/${encodeURIComponent(bookingId)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }
    );
  },
};
