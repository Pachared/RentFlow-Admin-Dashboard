export type PartnerSupportMessage = {
  id: string;
  at: string;
  from: "customer" | "agent" | "system";
  text: string;
  status?: string;
  isInternal?: boolean;
};

export type PartnerSupportOwner = {
  email: string;
  name?: string;
};

export type PartnerSupportTicket = {
  id: string;
  subject: string;
  customerName?: string;
  email?: string;
  phone?: string;
  channel: string;
  status: "new" | "open" | "waiting" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  ownerEmail?: string;
  bookingId?: string;
  bookingCode?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  messages: PartnerSupportMessage[];
  internalNotes: PartnerSupportMessage[];
  externalThreadId?: string;
};
