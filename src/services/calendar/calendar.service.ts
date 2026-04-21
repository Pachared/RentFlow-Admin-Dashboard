import { requestPartner } from "../core/api-client.service";
import type { PartnerAvailabilityBlock, PartnerCalendar } from "./calendar.types";

export const calendarService = {
  getCalendar() {
    return requestPartner<PartnerCalendar>("/partner/calendar");
  },

  createAvailabilityBlock(input: Omit<PartnerAvailabilityBlock, "id">) {
    return requestPartner<PartnerAvailabilityBlock>("/partner/availability-blocks", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deleteAvailabilityBlock(blockId: string) {
    return requestPartner<null>(
      `/partner/availability-blocks/${encodeURIComponent(blockId)}`,
      {
        method: "DELETE",
      }
    );
  },
};
