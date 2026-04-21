import { requestPartner } from "../core/api-client.service";
import type { PartnerDashboard } from "./dashboard.types";

export const dashboardService = {
  getDashboard() {
    return requestPartner<PartnerDashboard>("/partner/dashboard");
  },
};
