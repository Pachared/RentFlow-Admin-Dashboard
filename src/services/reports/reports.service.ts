import { requestPartner } from "../core/api-client.service";
import type { PartnerDashboard } from "../dashboard/dashboard.types";

export const reportsService = {
  getReports() {
    return requestPartner<PartnerDashboard>("/partner/reports");
  },
};
