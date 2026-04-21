import { requestPartner } from "../core/api-client.service";
import type { PartnerCustomer } from "./customers.types";

export const customersService = {
  getCustomers() {
    return requestPartner<{ items: PartnerCustomer[]; total: number }>(
      "/partner/customers"
    );
  },
};
