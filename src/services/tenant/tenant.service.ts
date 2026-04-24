import {
  RentFlowApiError,
  requestPartner,
  resolvePartnerAssetUrl,
} from "../core/api-client.service";
import type { PartnerTenant } from "./tenant.types";

type SaveMyTenantInput = {
  shopName: string;
  domainSlug: string;
  logoUrl?: string | null;
  promoImageUrl?: string | null;
  promoImageUrls?: string[] | null;
  logoFile?: File | null;
  promoImageFile?: File | null;
  promoImageFiles?: File[];
  clearPromoImages?: boolean;
};

function normalizeTenant(tenant: PartnerTenant): PartnerTenant {
  const promoImageUrls = (tenant.promoImageUrls || [])
    .map((url) => resolvePartnerAssetUrl(url))
    .filter(Boolean) as string[];
  const promoImageUrl = resolvePartnerAssetUrl(tenant.promoImageUrl) || promoImageUrls[0];

  return {
    ...tenant,
    logoUrl: resolvePartnerAssetUrl(tenant.logoUrl),
    promoImageUrl,
    promoImageUrls,
  };
}

async function saveTenantAsJson(input: SaveMyTenantInput) {
  const tenant = await requestPartner<PartnerTenant>("/tenants/me", {
    method: "POST",
    body: JSON.stringify({
      shopName: input.shopName,
      domainSlug: input.domainSlug,
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
      ...(input.promoImageUrl !== undefined
        ? { promoImageUrl: input.promoImageUrl }
        : {}),
      ...(input.promoImageUrls !== undefined
        ? { promoImageUrls: input.promoImageUrls }
        : {}),
      ...(input.clearPromoImages !== undefined
        ? { clearPromoImages: input.clearPromoImages }
        : {}),
    }),
  });
  return normalizeTenant(tenant);
}

export const tenantService = {
  async getMyTenant() {
    const tenant = await requestPartner<PartnerTenant>("/tenants/me");
    return normalizeTenant(tenant);
  },

  async saveMyTenant(input: SaveMyTenantInput) {
    const hasMediaChange =
      input.logoFile ||
      input.promoImageFile ||
      (input.promoImageFiles && input.promoImageFiles.length > 0) ||
      input.logoUrl !== undefined ||
      input.promoImageUrl !== undefined ||
      input.promoImageUrls !== undefined ||
      input.clearPromoImages;

    if (hasMediaChange) {
      const formData = new FormData();
      formData.append("shopName", input.shopName);
      formData.append("domainSlug", input.domainSlug);

      if (input.logoFile) {
        formData.append("logo", input.logoFile);
      } else if (input.logoUrl !== undefined) {
        formData.append("logoUrl", input.logoUrl ?? "");
      }

      if (input.promoImageFile) {
        formData.append("promoImage", input.promoImageFile);
      }
      if (input.promoImageFiles?.length) {
        input.promoImageFiles.forEach((file) => {
          formData.append("promoImages", file);
        });
      }
      if (input.promoImageUrls?.length) {
        input.promoImageUrls.forEach((url) => {
          formData.append("promoImageUrls", url);
        });
      } else if (input.promoImageUrl !== undefined) {
        formData.append("promoImageUrl", input.promoImageUrl ?? "");
      }
      if (input.clearPromoImages) {
        formData.append("clearPromoImages", "true");
      }

      try {
        const tenant = await requestPartner<PartnerTenant>("/tenants/me", {
          method: "POST",
          body: formData,
        });
        return normalizeTenant(tenant);
      } catch (error) {
        const canRetryAsJson =
          error instanceof RentFlowApiError &&
          error.status === 400 &&
          error.message.includes("ข้อมูลร้านไม่ถูกต้อง") &&
          (input.logoUrl !== undefined ||
            input.promoImageUrl !== undefined ||
            input.promoImageUrls !== undefined);

        if (canRetryAsJson) {
          return saveTenantAsJson(input);
        }

        throw error;
      }
    }

    return saveTenantAsJson(input);
  },
};
