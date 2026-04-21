import { requestPartner } from "../core/api-client.service";
import type { PartnerAuditLog } from "./audit.types";

export const auditService = {
  listAuditLogs() {
    return requestPartner<{ items: PartnerAuditLog[]; total: number }>(
      "/partner/audit-logs"
    );
  },
};
