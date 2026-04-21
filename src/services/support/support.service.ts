import { requestPartner } from "../core/api-client.service";
import type {
  PartnerSupportMessage,
  PartnerSupportOwner,
  PartnerSupportTicket,
} from "./support.types";

export const supportService = {
  getSupportTickets() {
    return requestPartner<{
      items: PartnerSupportTicket[];
      owners: PartnerSupportOwner[];
      total: number;
    }>("/partner/support");
  },

  updateSupportTicket(
    ticketId: string,
    input: {
      status?: PartnerSupportTicket["status"];
      priority?: PartnerSupportTicket["priority"];
      ownerEmail?: string;
    }
  ) {
    return requestPartner<null>(
      `/partner/support/tickets/${encodeURIComponent(ticketId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },

  createSupportMessage(
    ticketId: string,
    input: {
      message: string;
      isInternal?: boolean;
    }
  ) {
    return requestPartner<PartnerSupportMessage>(
      `/partner/support/tickets/${encodeURIComponent(ticketId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );
  },
};
