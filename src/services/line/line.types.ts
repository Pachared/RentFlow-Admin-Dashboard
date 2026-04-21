export type PartnerLineRecentEvent = {
  id: string;
  recipient: string;
  subject: string;
  body?: string;
  status: string;
  providerRef?: string;
  createdAt: string;
};

export type PartnerLineConnection = {
  tenantId?: string;
  shopName?: string;
  domainSlug?: string;
  webhookUrl: string;
  status: string;
  isConnected: boolean;
  channelId?: string;
  hasChannelSecret: boolean;
  hasAccessToken: boolean;
  displayName?: string;
  basicId?: string;
  botUserId?: string;
  pictureUrl?: string;
  lastVerifiedAt?: string;
  lastWebhookTestAt?: string;
  lastWebhookTestStatus?: string;
  lastError?: string;
  recentEvents?: PartnerLineRecentEvent[];
};

export type PartnerLineWebhookTest = {
  success: boolean;
  reason?: string;
  endpoint?: string;
};
