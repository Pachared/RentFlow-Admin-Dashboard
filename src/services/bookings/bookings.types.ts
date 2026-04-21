export type PartnerBooking = {
  id: string;
  bookingCode: string;
  carId: string;
  carName?: string;
  status: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalDays: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};
