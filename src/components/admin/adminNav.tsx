import type { SvgIconComponent } from "@mui/icons-material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

export type AdminNavGroup =
  | "Operations"
  | "Sales"
  | "Finance"
  | "Analytics"
  | "Administration";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: SvgIconComponent;
  group: AdminNavGroup;
  badge?: string;
  color?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "แดชบอร์ด",
    href: "/admin/dashboard",
    icon: DashboardRoundedIcon,
    group: "Operations",
    color: "#1D4ED8",
  },
  {
    label: "การจอง",
    href: "/admin/bookings",
    icon: CalendarMonthRoundedIcon,
    group: "Operations",
    color: "#4338CA",
  },
  {
    label: "ปฏิทินรถ",
    href: "/admin/calendar",
    icon: EventNoteRoundedIcon,
    group: "Operations",
    color: "#6D28D9",
  },
  {
    label: "จัดการรถ",
    href: "/admin/cars",
    icon: DirectionsCarRoundedIcon,
    group: "Operations",
    color: "#0369A1",
  },
  {
    label: "บริการเสริม",
    href: "/admin/addons",
    icon: ExtensionRoundedIcon,
    group: "Operations",
    color: "#0F766E",
  },
  {
    label: "จุดรับ-ส่ง / สาขา",
    href: "/admin/locations",
    icon: PlaceRoundedIcon,
    group: "Operations",
    color: "#047857",
  },
  {
    label: "ลูกค้า",
    href: "/admin/customers",
    icon: PeopleAltRoundedIcon,
    group: "Sales",
    color: "#B45309",
  },
  {
    label: "จองผ่านแชท",
    href: "/admin/leads",
    icon: ForumRoundedIcon,
    group: "Sales",
    color: "#C2410C",
  },
  {
    label: "โปรโมชัน",
    href: "/admin/promotions",
    icon: LocalOfferRoundedIcon,
    group: "Sales",
    color: "#B91C1C",
  },
  {
    label: "การชำระเงิน",
    href: "/admin/payments",
    icon: PaymentsRoundedIcon,
    group: "Finance",
    color: "#15803D",
  },
  {
    label: "ตรวจสลิป/ยืนยันชำระ",
    href: "/admin/payment-verification",
    icon: FactCheckRoundedIcon,
    group: "Finance",
    color: "#166534",
  },
  {
    label: "รายงาน",
    href: "/admin/reports",
    icon: AssessmentRoundedIcon,
    group: "Analytics",
    color: "#5B21B6",
  },
  {
    label: "AI Assistant",
    href: "/admin/ai",
    icon: AutoAwesomeRoundedIcon,
    group: "Analytics",
    color: "#7C3AED",
  },
  {
    label: "ตั้งค่าร้าน / Domain",
    href: "/admin/store-setup",
    icon: StorefrontRoundedIcon,
    group: "Administration",
    color: "#0F766E",
  },
  {
    label: "เชื่อม LINE OA",
    href: "/admin/line",
    icon: LinkRoundedIcon,
    group: "Administration",
    color: "#15803D",
  },
  {
    label: "ซัพพอร์ต",
    href: "/admin/support",
    icon: SupportAgentRoundedIcon,
    group: "Administration",
    color: "#BE185D",
  },
];
