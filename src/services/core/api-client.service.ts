import type { ApiResponse } from "../types/types";

export class RentFlowApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RentFlowApiError";
    this.status = status;
  }
}

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /\/$/,
    ""
  );
}

export async function requestPartner<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
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
