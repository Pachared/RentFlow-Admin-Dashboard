import { requestPartner } from "../core/api-client.service";
import type {
  CreatePartnerAvailabilityBlockInput,
  PartnerAvailabilityBlock,
  PartnerCalendar,
} from "./calendar.types";

export const calendarService = {
  getCalendar() {
    return requestPartner<PartnerCalendar>("/partner/calendar");
  },

  createAvailabilityBlock(input: CreatePartnerAvailabilityBlockInput) {
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
