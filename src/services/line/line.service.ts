import { requestPartner } from "../core/api-client.service";
import type {
  PartnerLineConnection,
  PartnerLineWebhookTest,
} from "./line.types";

export const lineService = {
  getLineMessaging() {
    return requestPartner<PartnerLineConnection>("/partner/messaging/line");
  },

  saveLineMessaging(input: {
    channelId: string;
    channelSecret: string;
    accessToken: string;
  }) {
    return requestPartner<PartnerLineConnection>("/partner/messaging/line", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  testLineMessaging(input?: {
    channelId?: string;
    channelSecret?: string;
    accessToken?: string;
  }) {
    return requestPartner<{ connection: PartnerLineConnection }>(
      "/partner/messaging/line/test",
      {
        method: "POST",
        body: JSON.stringify(input || {}),
      }
    );
  },

  testLineWebhook(input?: {
    channelId?: string;
    channelSecret?: string;
    accessToken?: string;
    endpoint?: string;
  }) {
    return requestPartner<{
      connection: PartnerLineConnection;
      webhookTest: PartnerLineWebhookTest;
    }>("/partner/messaging/line/webhook/test", {
      method: "POST",
      body: JSON.stringify(input || {}),
    });
  },

  deleteLineMessaging() {
    return requestPartner<null>("/partner/messaging/line", {
      method: "DELETE",
    });
  },
};
