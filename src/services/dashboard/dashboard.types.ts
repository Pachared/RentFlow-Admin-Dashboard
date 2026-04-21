import type { PartnerCarStatus } from "../cars/cars.types";
import type { PartnerTenant } from "../tenant/tenant.types";

export type PartnerDashboard = {
  tenant: PartnerTenant;
  summary: {
    totalCars: number;
    availableCars: number;
    totalBranches: number;
    activeBranches: number;
    totalBookings: number;
    todayPickups: number;
    todayReturns: number;
    totalRevenue: number;
    totalReviews: number;
  };
  bookingStatus: Record<string, number>;
  fleetStatus: Record<PartnerCarStatus, number>;
  weeklySales: Array<{ day: string; key: string; bookings: number; revenue: number }>;
  topCars: Array<{ id: string; name: string; bookings: number; revenue: number }>;
  recentBookings: Array<{
    id: string;
    bookingCode: string;
    carId: string;
    carName: string;
    customerName: string;
    pickupDate: string;
    returnDate: string;
    status: string;
    totalAmount: number;
    revenue: number;
    createdAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    firstName: string;
    lastName: string;
    rating: number;
    comment?: string;
    createdAt?: string;
  }>;
};
