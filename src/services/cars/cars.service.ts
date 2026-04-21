import { requestPartner } from "../core/api-client.service";
import { normalizePartnerCar } from "./cars.mapper";
import type { PartnerCar, PartnerCarPayload } from "./cars.types";

export const carsService = {
  async getCars() {
    const response = await requestPartner<{ items: PartnerCar[]; total: number }>(
      "/partner/cars"
    );
    return {
      ...response,
      items: response.items.map(normalizePartnerCar),
    };
  },

  async createCar(input: PartnerCarPayload) {
    const car = await requestPartner<PartnerCar>("/partner/cars", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizePartnerCar(car);
  },

  async updateCar(carId: string, input: PartnerCarPayload) {
    const car = await requestPartner<PartnerCar>(
      `/partner/cars/${encodeURIComponent(carId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );
    return normalizePartnerCar(car);
  },

  deleteCar(carId: string) {
    return requestPartner<null>(`/partner/cars/${encodeURIComponent(carId)}`, {
      method: "DELETE",
    });
  },

  uploadCarImages(
    carId: string,
    files: File[],
    options?: { replace?: boolean }
  ) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return requestPartner<{ items: Array<{ imageUrl: string }>; total: number }>(
      `/partner/cars/${encodeURIComponent(carId)}/images${
        options?.replace ? "?replace=true" : ""
      }`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  deleteCarImage(carId: string, imageId: string) {
    return requestPartner<null>(
      `/partner/cars/${encodeURIComponent(carId)}/images/${encodeURIComponent(
        imageId
      )}`,
      {
        method: "DELETE",
      }
    );
  },

  reorderCarImages(carId: string, imageIds: string[]) {
    return requestPartner<null>(
      `/partner/cars/${encodeURIComponent(carId)}/images/reorder`,
      {
        method: "PATCH",
        body: JSON.stringify({ imageIds }),
      }
    );
  },
};
