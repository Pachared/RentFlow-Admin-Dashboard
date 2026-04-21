import { requestPartner } from "../core/api-client.service";
import type { PartnerBranch, PartnerBranchPayload } from "./branches.types";

export const branchesService = {
  getBranches() {
    return requestPartner<{ items: PartnerBranch[]; total: number }>(
      "/partner/branches"
    );
  },

  createBranch(input: PartnerBranchPayload) {
    return requestPartner<PartnerBranch>("/partner/branches", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateBranch(branchId: string, input: PartnerBranchPayload) {
    return requestPartner<PartnerBranch>(
      `/partner/branches/${encodeURIComponent(branchId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
  },

  deleteBranch(branchId: string) {
    return requestPartner<null>(
      `/partner/branches/${encodeURIComponent(branchId)}`,
      {
        method: "DELETE",
      }
    );
  },
};
