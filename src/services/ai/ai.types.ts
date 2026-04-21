export type PartnerAiMetric = {
  label: string;
  value?: number;
  displayValue: string | number;
  detail: string;
  tone: "default" | "success" | "warning" | "info" | "danger";
};

export type PartnerAiAlert = {
  tone: "success" | "warning" | "info" | "danger";
  title: string;
  detail: string;
};

export type PartnerAiAction = {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type PartnerAiTopCar = {
  carId: string;
  carName: string;
  bookings: number;
  revenue: number;
  isHighlighted: boolean;
};

export type PartnerAiAssistant = {
  provider: string;
  summary: string;
  metrics: PartnerAiMetric[];
  alerts: PartnerAiAlert[];
  actions: PartnerAiAction[];
  topCars: PartnerAiTopCar[];
  generatedAt: string;
};
