export type PartnerTenant = {
  id: string;
  ownerEmail?: string;
  shopName: string;
  domainSlug: string;
  publicDomain: string;
  logoUrl?: string;
  promoImageUrl?: string;
  promoImageUrls?: string[];
  status: string;
  plan: string;
  createdAt?: string;
  updatedAt?: string;
};
