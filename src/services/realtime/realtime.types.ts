export type PartnerRealtimeEventType =
  | "connection.ready"
  | "booking.created"
  | "booking.updated"
  | "booking.cancelled"
  | "payment.created"
  | "payment.updated"
  | "notification.new"
  | "car.changed"
  | "branch.changed"
  | "availability.changed"
  | "support.changed"
  | "tenant.updated";

export type PartnerRealtimeEvent = {
  type: PartnerRealtimeEventType | string;
  tenantId?: string;
  entityId?: string;
  data?: Record<string, unknown>;
  createdAt?: string;
};

