import { resolvePartnerAssetUrl } from "@/src/services/core/api-client.service";
import { readClientCookie, writeClientCookie } from "./client-cookie";

export const PARTNER_STORE_KEY = "rentflow_partner_store";
export const PARTNER_STORE_COOKIE = "rf_store_domain";
export const RENTFLOW_ROOT_DOMAIN =
    process.env.NEXT_PUBLIC_RENTFLOW_ROOT_DOMAIN || "rentflow.com";

const RESERVED_SUBDOMAINS = new Set([
    "platform",
    "api",
    "app",
    "assets",
    "cdn",
    "dashboard",
    "partner",
    "rentflow",
    "root",
    "static",
    "support",
    "www",
]);

export type PartnerStoreProfile = {
    tenantId?: string;
    shopName: string;
    domainSlug: string;
    storefrontDomain: string;
    ownerEmail?: string;
    status?: string;
    plan?: string;
    logoUrl?: string;
    promoImageUrl?: string;
    promoImageUrls?: string[];
    createdAt: string;
    updatedAt: string;
};

export function normalizeDomainSlug(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
}

export function buildStorefrontDomain(domainSlug: string) {
    return `${normalizeDomainSlug(domainSlug)}.${RENTFLOW_ROOT_DOMAIN}`;
}

export function isReservedDomainSlug(domainSlug: string) {
    return RESERVED_SUBDOMAINS.has(normalizeDomainSlug(domainSlug));
}

export function validateDomainSlug(domainSlug: string) {
    const slug = normalizeDomainSlug(domainSlug);

    if (slug.length < 3) return "ชื่อโดเมนต้องมีอย่างน้อย 3 ตัวอักษร";
    if (slug.length > 40) return "ชื่อโดเมนต้องไม่เกิน 40 ตัวอักษร";
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
        return "ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง โดยห้ามขึ้นต้นหรือท้ายด้วยขีดกลาง";
    }
    if (isReservedDomainSlug(slug)) {
        return "ชื่อนี้ถูกสงวนไว้สำหรับระบบ กรุณาใช้ชื่ออื่น";
    }

    return "";
}

export function readStoreProfile() {
    if (typeof window === "undefined") return null;

    const raw = readClientCookie(PARTNER_STORE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as PartnerStoreProfile;
        return {
            ...parsed,
            logoUrl: resolvePartnerAssetUrl(parsed.logoUrl),
            promoImageUrl: resolvePartnerAssetUrl(parsed.promoImageUrl),
            promoImageUrls: (parsed.promoImageUrls || [])
                .map((url) => resolvePartnerAssetUrl(url))
                .filter(Boolean) as string[],
        };
    } catch {
        return null;
    }
}

export function writeStoreProfile(input: {
    shopName: string;
    domainSlug: string;
    tenantId?: string;
    storefrontDomain?: string;
    ownerEmail?: string;
    status?: string;
    plan?: string;
    logoUrl?: string | null;
    promoImageUrl?: string | null;
    promoImageUrls?: string[] | null;
    createdAt?: string;
    updatedAt?: string;
}) {
    const now = new Date().toISOString();
    const existing = readStoreProfile();
    const domainSlug = normalizeDomainSlug(input.domainSlug);
    const profile: PartnerStoreProfile = {
        tenantId: input.tenantId,
        shopName: input.shopName.trim(),
        domainSlug,
        storefrontDomain: input.storefrontDomain || buildStorefrontDomain(domainSlug),
        ownerEmail: input.ownerEmail,
        status: input.status,
        plan: input.plan,
        logoUrl: resolvePartnerAssetUrl(
            input.logoUrl === undefined
                ? existing?.logoUrl
                : input.logoUrl || undefined
        ),
        promoImageUrl: resolvePartnerAssetUrl(
            input.promoImageUrl === undefined
                ? existing?.promoImageUrl
                : input.promoImageUrl || undefined
        ),
        promoImageUrls:
            input.promoImageUrls === undefined
                ? existing?.promoImageUrls || []
                : (input.promoImageUrls || [])
                      .map((url) => resolvePartnerAssetUrl(url))
                      .filter(Boolean) as string[],
        createdAt: input.createdAt ?? existing?.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
    };

    writeClientCookie(PARTNER_STORE_KEY, JSON.stringify(profile), {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "Strict",
    });
    writeClientCookie(PARTNER_STORE_COOKIE, profile.storefrontDomain, {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "Strict",
    });
    window.dispatchEvent(new Event("rentflow-store-profile-updated"));

    return profile;
}
