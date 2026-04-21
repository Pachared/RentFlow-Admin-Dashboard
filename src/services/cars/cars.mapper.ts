import type { PartnerCar } from "./cars.types";

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /\/$/,
    ""
  );
}

export function resolveApiAssetUrl(value?: string) {
  const rawValue = value?.trim() || "";
  if (!rawValue || rawValue.startsWith("data:") || rawValue.startsWith("blob:")) {
    return rawValue;
  }
  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }
  if (rawValue.startsWith("/")) {
    return new URL(rawValue, apiBaseUrl()).toString();
  }
  return rawValue;
}

export function normalizePartnerCar(car: PartnerCar): PartnerCar {
  const imageUrl = resolveApiAssetUrl(car.imageUrl || car.image);
  const images = car.images?.map(resolveApiAssetUrl).filter(Boolean);

  return {
    ...car,
    image: imageUrl,
    imageUrl,
    images: images?.length ? images : imageUrl ? [imageUrl] : [],
  };
}
