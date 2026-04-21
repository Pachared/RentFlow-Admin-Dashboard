import { requestPartner } from "../core/api-client.service";
import type { PartnerAiAssistant } from "./ai.types";

export const aiService = {
  getAssistant() {
    return requestPartner<PartnerAiAssistant>("/partner/ai/assistant");
  },
};
