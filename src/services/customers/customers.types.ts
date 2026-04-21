export type PartnerCustomer = {
  name: string;
  email?: string;
  phone?: string;
  bookings: number;
  totalAmount: number;
  lastBookingAt?: string;
};
