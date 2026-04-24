import type { ApiResponse } from "../types/types";

export class RentFlowApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RentFlowApiError";
    this.status = status;
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPartnerApiBaseUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  );
}

export function resolvePartnerAssetUrl(value?: string | null) {
  const rawValue = value?.trim() || "";
  if (
    !rawValue ||
    rawValue.startsWith("data:") ||
    rawValue.startsWith("blob:") ||
    rawValue.startsWith("//")
  ) {
    return rawValue;
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  return new URL(
    rawValue.startsWith("/") ? rawValue : `/${rawValue}`,
    getPartnerApiBaseUrl()
  ).toString();
}

export async function requestPartner<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const isFormData =
    !!body &&
    typeof body === "object" &&
    ((typeof FormData !== "undefined" && body instanceof FormData) ||
      (Object.prototype.toString.call(body) === "[object FormData]" &&
        typeof (body as FormData).append === "function"));

  if (isFormData) {
    headers.delete("Content-Type");
  }

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getPartnerApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok) {
    throw new RentFlowApiError(
      payload?.message || "ไม่สามารถเชื่อมต่อ API ได้",
      response.status
    );
  }

  if (payload && "data" in payload) {
    return payload.data;
  }

  return payload as T;
}
