export type PartnerNavGroup =
  | "Operations"
  | "Sales"
  | "Finance"
  | "Analytics"
  | "Settings";

export type PartnerNavItem = {
  label: string;
  href: string;
  group: PartnerNavGroup;
  badge?: string;
};

export const PARTNER_NAV: PartnerNavItem[] = [
  { label: "ภาพรวม", href: "/partner/dashboard", group: "Operations" },
  { label: "ตั้งค่าร้าน", href: "/partner/store-setup", group: "Operations" },
  { label: "จัดหน้าเว็บ", href: "/partner/store-builder", group: "Operations" },
  { label: "รถของร้าน", href: "/partner/cars", group: "Operations" },
  { label: "สาขา", href: "/partner/locations", group: "Operations" },
  { label: "การจอง", href: "/partner/bookings", group: "Sales" },
  { label: "ลูกค้า", href: "/partner/customers", group: "Sales" },
  { label: "ลูกค้าเป้าหมาย", href: "/partner/leads", group: "Sales" },
  { label: "ชำระเงิน", href: "/partner/payments", group: "Finance" },
  { label: "ยืนยันชำระเงิน", href: "/partner/payment-verification", group: "Finance" },
  { label: "ปฏิทิน", href: "/partner/calendar", group: "Analytics" },
  { label: "โปรโมชัน", href: "/partner/promotions", group: "Analytics" },
  { label: "บริการเสริม", href: "/partner/addons", group: "Analytics" },
  { label: "รายงาน", href: "/partner/reports", group: "Analytics" },
  { label: "บัญชีไลน์", href: "/partner/line", group: "Settings" },
  { label: "ผู้ช่วยอัจฉริยะ", href: "/partner/ai", group: "Settings", badge: "ใหม่" },
  { label: "ช่วยเหลือ", href: "/partner/support", group: "Settings" },
];
