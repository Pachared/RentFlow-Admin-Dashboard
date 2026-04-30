import type {
  StorefrontBlock,
  StorefrontPage,
} from "@/src/services/storefront/storefront.types";

export const DEFAULT_STOREFRONT_THEME: NonNullable<StorefrontPage["theme"]> = {
  primaryColor: "#0b5cff",
  accentColor: "#111827",
  surfaceColor: "#f5f5f7",
};

export const DEFAULT_STOREFRONT_BLOCKS: StorefrontBlock[] = [
  {
    id: "default-storefront-hero",
    type: "hero",
    subtitle: "เช่ารถง่าย แค่ปลายนิ้ว",
    title: "รถที่ใช่ สำหรับทุกการเดินทาง",
    description:
      "ค้นหารถ เลือกช่วงเวลา ตรวจสอบราคา และเริ่มจองได้จากหน้าเดียว พร้อมประสบการณ์ที่เรียบง่ายและชัดเจน",
    buttonLabel: "ดูรถทั้งหมด",
    href: "/cars",
    tone: "dark",
    align: "center",
  },
  {
    id: "default-storefront-clear-price",
    type: "feature",
    subtitle: "จุดเด่น",
    title: "ราคาชัดเจนก่อนตัดสินใจ",
    description:
      "แสดงราคาเริ่มต้น รายละเอียดรถ และข้อมูลสำคัญให้ลูกค้าเข้าใจง่ายก่อนจอง",
    buttonLabel: "ดูรถทั้งหมด",
    href: "/cars",
    tone: "default",
    align: "left",
  },
  {
    id: "default-storefront-steps",
    type: "steps",
    subtitle: "ขั้นตอนการจอง",
    title: "เลือกวัน เลือกรถ แล้วส่งคำขอจอง",
    description:
      "ลูกค้าสามารถเลือกวันรับรถ วันคืนรถ สาขา และรุ่นที่ต้องการได้อย่างเป็นขั้นตอน",
    buttonLabel: "เริ่มจองรถ",
    href: "/cars",
    tone: "default",
    align: "left",
  },
  {
    id: "default-storefront-service",
    type: "feature",
    subtitle: "บริการ",
    title: "พร้อมดูแลตั้งแต่ก่อนรับรถจนคืนรถ",
    description:
      "ใช้พื้นที่นี้สื่อสารบริการของร้าน เช่น การตรวจเช็กรถ การรับส่งรถ หรือช่องทางติดต่อ",
    buttonLabel: "ติดต่อร้าน",
    href: "/contact",
    tone: "highlight",
    align: "left",
  },
  {
    id: "default-storefront-reviews",
    type: "testimonial",
    subtitle: "เสียงจากลูกค้า",
    title: "เพิ่มความมั่นใจด้วยรีวิวและประสบการณ์จริง",
    description:
      "เจ้าของร้านสามารถปรับข้อความส่วนนี้ให้เป็นรีวิว จุดขาย หรือคำรับรองจากลูกค้าได้",
    buttonLabel: "อ่านรีวิวทั้งหมด",
    href: "/reviews",
    tone: "default",
    align: "left",
  },
  {
    id: "default-storefront-cta",
    type: "cta",
    subtitle: "พร้อมออกเดินทาง",
    title: "เลือกรถที่เหมาะกับคุณ แล้วเริ่มจองได้เลย",
    description:
      "พาลูกค้าไปยังหน้ารถทั้งหมดหรือหน้าติดต่อ เพื่อให้ตัดสินใจต่อได้ง่ายขึ้น",
    buttonLabel: "เลือกดูรถ",
    href: "/cars",
    tone: "dark",
    align: "center",
  },
];

export function cloneDefaultStorefrontBlocks() {
  return DEFAULT_STOREFRONT_BLOCKS.map((block) => ({ ...block }));
}
