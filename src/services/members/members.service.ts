import { requestPartner } from "../core/api-client.service";
import type { PartnerMember, PartnerMemberInput } from "./members.types";

export const membersService = {
  listMembers() {
    return requestPartner<{ items: PartnerMember[]; total: number }>(
      "/partner/members"
    );
  },

  createMember(input: PartnerMemberInput) {
    return requestPartner<PartnerMember>("/partner/members", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateMember(id: string, input: PartnerMemberInput) {
    return requestPartner<null>(`/partner/members/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteMember(id: string) {
    return requestPartner<null>(`/partner/members/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
