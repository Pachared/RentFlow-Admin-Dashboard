"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { addonsService } from "@/src/services/addons/addons.service";
import type { PartnerAddon } from "@/src/services/addons/addons.types";
import { auditService } from "@/src/services/audit/audit.service";
import type { PartnerAuditLog } from "@/src/services/audit/audit.types";
import { bookingsService } from "@/src/services/bookings/bookings.service";
import type { PartnerBooking } from "@/src/services/bookings/bookings.types";
import { calendarService } from "@/src/services/calendar/calendar.service";
import type { PartnerAvailabilityBlock } from "@/src/services/calendar/calendar.types";
import { customersService } from "@/src/services/customers/customers.service";
import type { PartnerCustomer } from "@/src/services/customers/customers.types";
import type { PartnerDashboard } from "@/src/services/dashboard/dashboard.types";
import { domainsService } from "@/src/services/domains/domains.service";
import type { PartnerDomain } from "@/src/services/domains/domains.types";
import { leadsService } from "@/src/services/leads/leads.service";
import type { PartnerLead } from "@/src/services/leads/leads.types";
import { membersService } from "@/src/services/members/members.service";
import type { PartnerMember } from "@/src/services/members/members.types";
import { usePartnerRealtimeRefresh } from "@/src/hooks/realtime/usePartnerRealtimeRefresh";
import { paymentsService } from "@/src/services/payments/payments.service";
import type { PartnerPayment } from "@/src/services/payments/payments.types";
import { promotionsService } from "@/src/services/promotions/promotions.service";
import type { PartnerPromotion } from "@/src/services/promotions/promotions.types";
import { reportsService } from "@/src/services/reports/reports.service";
import type { PartnerRealtimeEventType } from "@/src/services/realtime/realtime.types";

type Snack = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

function formatTHB(value: number) {
  return `${new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} บาท`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function bookingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    confirmed: "ยืนยันแล้ว",
    paid: "ชำระแล้ว",
    active: "กำลังเช่า",
    review: "รอตรวจสอบ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };
  return labels[status] || status;
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    all: "ทั้งหมด",
    pending: "รอดำเนินการ",
    confirmed: "ยืนยันแล้ว",
    paid: "ชำระแล้ว",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
    failed: "ไม่สำเร็จ",
    refunded: "คืนเงินแล้ว",
    settled: "ปิดยอดแล้ว",
    pending_payout: "รอปิดยอด",
    none: "ไม่มี",
    active: "เปิดใช้งาน",
    inactive: "ปิดใช้งาน",
    verified: "ยืนยันแล้ว",
    unverified: "รอยืนยัน",
    draft: "แบบร่าง",
    open: "กำลังดำเนินการ",
    waiting: "รอตอบกลับ",
    resolved: "แก้ไขแล้ว",
    closed: "ปิดแล้ว",
    new: "ใหม่",
    percent: "เปอร์เซ็นต์",
    amount: "จำนวนเงิน",
    fixed: "จำนวนเงิน",
    day: "ต่อวัน",
    trip: "ต่อทริป",
    booking: "ต่อการจอง",
  };
  return labels[status || ""] || status || "-";
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    owner: "เจ้าของร้าน",
    finance: "การเงิน",
    support: "ดูแลลูกค้า",
    staff: "พนักงาน",
  };
  return labels[role || ""] || role || "-";
}

const PARTNER_PERMISSION_OPTIONS = [
  { key: "cars.write", label: "จัดการรถ" },
  { key: "branches.write", label: "จัดการสาขา" },
  { key: "bookings.write", label: "จัดการจอง" },
  { key: "payments.write", label: "จัดการชำระเงิน" },
  { key: "customers.read", label: "ดูลูกค้า" },
  { key: "reports.read", label: "ดูรายงาน" },
  { key: "support.write", label: "ตอบลูกค้า" },
  { key: "audit.read", label: "ดูประวัติ" },
] as const;

function paymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    cash: "เงินสด",
    bank_transfer: "โอนผ่านธนาคาร",
    promptpay: "พร้อมเพย์",
    prompt_pay: "พร้อมเพย์",
    credit_card: "บัตรเครดิต",
    slip: "แนบสลิป",
  };
  return labels[method || ""] || method || "-";
}

function auditActionLabel(action?: string) {
  const labels: Record<string, string> = {
    "member.create": "เพิ่มสมาชิกทีม",
    "member.update": "แก้ไขสมาชิกทีม",
    "member.delete": "ลบสมาชิกทีม",
    "promotion.create": "เพิ่มโปรโมชัน",
    "promotion.update": "แก้ไขโปรโมชัน",
    "promotion.delete": "ลบโปรโมชัน",
    "addon.create": "เพิ่มบริการเสริม",
    "addon.update": "แก้ไขบริการเสริม",
    "addon.delete": "ลบบริการเสริม",
    "lead.create": "เพิ่มลูกค้าเป้าหมาย",
    "lead.update": "แก้ไขลูกค้าเป้าหมาย",
    "lead.delete": "ลบลูกค้าเป้าหมาย",
    "domain.create": "เพิ่มโดเมน",
    "domain.verify": "ตรวจสอบโดเมน",
    "domain.delete": "ลบโดเมน",
    "booking.update_status": "อัปเดตสถานะการจอง",
    "payment.verify": "ยืนยันการชำระเงิน",
    "payment.refund": "คืนเงิน",
    "payment.settle": "ปิดยอดเข้าร้าน",
  };
  return labels[action || ""] || "รายการเปลี่ยนแปลง";
}

function fieldLabel(field: string) {
  const labels: Record<string, string> = {
    code: "รหัส",
    name: "ชื่อ",
    description: "รายละเอียด",
    discountType: "รูปแบบส่วนลด",
    discountValue: "มูลค่าส่วนลด",
    price: "ราคา",
    unit: "หน่วยคิดราคา",
    email: "อีเมล",
    phone: "เบอร์โทร",
    source: "ช่องทางที่มา",
    status: "สถานะ",
    interestedCar: "รถที่สนใจ",
    note: "หมายเหตุ",
  };
  return labels[field] || field;
}

function fieldOptions(field: string) {
  const options: Record<string, Array<{ value: string; label: string }>> = {
    discountType: [
      { value: "percent", label: "เปอร์เซ็นต์" },
      { value: "amount", label: "จำนวนเงิน" },
    ],
    unit: [
      { value: "day", label: "ต่อวัน" },
      { value: "trip", label: "ต่อทริป" },
      { value: "booking", label: "ต่อการจอง" },
    ],
    status: [
      { value: "new", label: "ใหม่" },
      { value: "open", label: "กำลังดำเนินการ" },
      { value: "waiting", label: "รอตอบกลับ" },
      { value: "resolved", label: "แก้ไขแล้ว" },
      { value: "closed", label: "ปิดแล้ว" },
    ],
  };
  return options[field] || null;
}

function statusChipClass(status?: string) {
  const normalized = (status || "").toLowerCase();
  if (
    ["paid", "completed", "active", "verified", "settled", "resolved"].includes(
      normalized
    ) ||
    ["ชำระแล้ว", "เสร็จสิ้น", "เปิดใช้งาน", "ยืนยันแล้ว", "แก้ไขแล้ว"].includes(status || "")
  ) {
    return "partner-chip partner-chip-green";
  }
  if (
    ["cancelled", "failed", "refunded", "closed", "inactive"].includes(normalized) ||
    ["ยกเลิก", "ไม่สำเร็จ", "คืนเงินแล้ว", "ปิดแล้ว", "ปิดใช้งาน"].includes(status || "")
  ) {
    return "partner-chip partner-chip-rose";
  }
  if (
    ["pending", "waiting", "draft", "pending_payout", "new"].includes(normalized) ||
    ["รอดำเนินการ", "รอตอบกลับ", "แบบร่าง", "รอปิดยอด", "ใหม่"].includes(status || "")
  ) {
    return "partner-chip partner-chip-orange";
  }
  if (["confirmed", "open"].includes(normalized) || ["กำลังดำเนินการ"].includes(status || "")) {
    return "partner-chip partner-chip-blue";
  }
  return "partner-chip";
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      className="partner-page-header partner-page-header-with-action items-start justify-between md:items-end"
    >
      <Box>
        <Typography className="partner-page-title">
          {title}
        </Typography>
        <Typography className="partner-page-subtitle">{description}</Typography>
      </Box>
      {action ? <Box className="partner-header-action">{action}</Box> : null}
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Card elevation={0} className="partner-card rounded-[30px]!">
      <CardContent className="grid min-h-72 place-items-center">
        <CircularProgress />
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Box className="partner-empty min-h-56">
      <Typography className="text-sm font-semibold text-slate-500">{label}</Typography>
    </Box>
  );
}

function PageSnack({
  snack,
  onClose,
}: {
  snack: Snack;
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={snack.severity} onClose={onClose}>
        {snack.message}
      </Alert>
    </Snackbar>
  );
}

function useSnack() {
  const [snack, setSnack] = React.useState<Snack>({
    open: false,
    message: "",
    severity: "success",
  });
  const close = () => setSnack((prev) => ({ ...prev, open: false }));
  return { snack, setSnack, close };
}

export function PartnerBookingsPage() {
  const [items, setItems] = React.useState<PartnerBooking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("all");
  const [operationDraft, setOperationDraft] = React.useState<{
    booking: PartnerBooking;
    type: "inspection" | "handover" | "return" | "damage" | "fine" | "note";
    odometer: string;
    fuelLevel: string;
    damageNote: string;
    fineAmount: string;
    staffNote: string;
    checklistText: string;
  } | null>(null);
  const { snack, setSnack, close } = useSnack();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingsService.getBookings(status);
      setItems(response.items);
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดการจองไม่สำเร็จ", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [setSnack, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  usePartnerRealtimeRefresh({
    events: ["booking.created", "booking.updated", "booking.cancelled"],
    onRefresh: load,
  });

  async function updateStatus(booking: PartnerBooking, nextStatus: string) {
    try {
      await bookingsService.updateBookingStatus(booking.id, nextStatus);
      setSnack({ open: true, message: "อัปเดตการจองสำเร็จ", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "อัปเดตการจองไม่สำเร็จ", severity: "error" });
    }
  }

  function openOperation(booking: PartnerBooking, type: "inspection" | "handover" | "return" | "damage" | "fine" | "note") {
    const checklist =
      type === "handover"
        ? ["ตรวจเอกสารผู้เช่า", "ตรวจสภาพรถก่อนส่งมอบ", "บันทึกเลขไมล์"]
        : type === "return"
          ? ["ตรวจสภาพรถหลังคืน", "ตรวจน้ำมัน", "ยืนยันคืนรถเรียบร้อย"]
          : ["บันทึกเหตุการณ์"];
    setOperationDraft({
      booking,
      type,
      odometer: "",
      fuelLevel: "",
      damageNote: "",
      fineAmount: "",
      staffNote: "",
      checklistText: checklist.join("\n"),
    });
  }

  async function createOperation() {
    if (!operationDraft) return;
    try {
      await bookingsService.createBookingOperation(operationDraft.booking.id, {
        type: operationDraft.type,
        checklist: operationDraft.checklistText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        odometer: Number(operationDraft.odometer || 0),
        fuelLevel: operationDraft.fuelLevel,
        damageNote: operationDraft.damageNote,
        fineAmount: Number(operationDraft.fineAmount || 0),
        staffNote: operationDraft.staffNote,
      });
      setOperationDraft(null);
      setSnack({ open: true, message: "บันทึกงานรถสำเร็จ", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "บันทึกงานรถไม่สำเร็จ", severity: "error" });
    }
  }

  return (
    <Box className="partner-page">
      <SectionHeader
        title="การจอง"
        description="ดูและจัดการสถานะการจองของร้านในที่เดียว"
        action={
          <TextField select size="small" label="สถานะ" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full md:w-48">
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="pending">รอดำเนินการ</MenuItem>
            <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
            <MenuItem value="paid">ชำระแล้ว</MenuItem>
            <MenuItem value="active">กำลังเช่า</MenuItem>
            <MenuItem value="review">รอตรวจสอบ</MenuItem>
            <MenuItem value="completed">เสร็จสิ้น</MenuItem>
            <MenuItem value="cancelled">ยกเลิก</MenuItem>
          </TextField>
        }
      />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-0!">
            {items.length === 0 ? <EmptyState label="ยังไม่มีการจอง" /> : items.map((booking, index) => (
              <Box key={booking.id}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="items-start justify-between p-4">
                  <Box>
                    <Typography className="font-black text-slate-950">{booking.bookingCode} • {booking.customerName}</Typography>
                    <Typography className="text-sm text-slate-600">{booking.carName || booking.carId}</Typography>
                    <Typography className="text-sm text-slate-500">{formatDate(booking.pickupDate)} - {formatDate(booking.returnDate)}</Typography>
                    <Typography className="mt-1 font-bold text-slate-900">{formatTHB(booking.totalAmount)}</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} className="w-full md:w-auto">
                    <Chip
                      label={bookingStatusLabel(booking.status)}
                      className={statusChipClass(booking.status)}
                    />
                    <TextField select size="small" label="เปลี่ยนสถานะ" defaultValue={booking.status} onChange={(e) => updateStatus(booking, e.target.value)} className="w-full sm:w-44">
                      <MenuItem value="pending">รอดำเนินการ</MenuItem>
                      <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
                      <MenuItem value="paid">ชำระแล้ว</MenuItem>
                      <MenuItem value="active">กำลังเช่า</MenuItem>
                      <MenuItem value="review">รอตรวจสอบ</MenuItem>
                      <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                      <MenuItem value="cancelled">ยกเลิก</MenuItem>
                    </TextField>
                  </Stack>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} className="px-4 pb-4">
                  <Button variant="outlined" onClick={() => openOperation(booking, "inspection")} className="rounded-full!">
                    ตรวจรถ
                  </Button>
                  <Button variant="outlined" onClick={() => openOperation(booking, "handover")} className="rounded-full!">
                    ส่งมอบรถ
                  </Button>
                  <Button variant="outlined" onClick={() => openOperation(booking, "return")} className="rounded-full!">
                    รับคืนรถ
                  </Button>
                  <Button variant="outlined" color="warning" onClick={() => openOperation(booking, "damage")} className="rounded-full!">
                    บันทึกความเสียหาย
                  </Button>
                </Stack>
                {index < items.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
      <Dialog open={!!operationDraft} onClose={() => setOperationDraft(null)} fullWidth maxWidth="sm">
        <DialogTitle className="font-black!">
          บันทึกงานรถ
        </DialogTitle>
        <DialogContent className="grid gap-3! pt-2!">
          <Typography className="text-sm text-slate-500">
            {operationDraft?.booking.bookingCode} • {operationDraft?.booking.carName || operationDraft?.booking.carId}
          </Typography>
          <TextField
            label="เช็กลิสต์"
            multiline
            minRows={4}
            value={operationDraft?.checklistText || ""}
            onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, checklistText: e.target.value } : prev)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="เลขไมล์"
              type="number"
              value={operationDraft?.odometer || ""}
              onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, odometer: e.target.value } : prev)}
              fullWidth
            />
            <TextField
              label="ระดับน้ำมัน"
              value={operationDraft?.fuelLevel || ""}
              onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, fuelLevel: e.target.value } : prev)}
              fullWidth
            />
          </Stack>
          <TextField
            label="บันทึกความเสียหาย"
            value={operationDraft?.damageNote || ""}
            onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, damageNote: e.target.value } : prev)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="ค่าปรับ"
              type="number"
              value={operationDraft?.fineAmount || ""}
              onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, fineAmount: e.target.value } : prev)}
              fullWidth
            />
            <TextField
              label="หมายเหตุทีมงาน"
              value={operationDraft?.staffNote || ""}
              onChange={(e) => setOperationDraft((prev) => prev ? { ...prev, staffNote: e.target.value } : prev)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6! pb-5!">
          <Button variant="outlined" onClick={() => setOperationDraft(null)}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={createOperation}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

type PartnerPaymentFilter =
  | "all"
  | "needs_review"
  | "paid"
  | "pending_payout"
  | "settled"
  | "refunded"
  | "failed";

function paymentNeedsReview(payment: PartnerPayment) {
  return payment.status !== "paid" || !payment.verifiedAt;
}

function matchesPaymentFilter(
  payment: PartnerPayment,
  filter: PartnerPaymentFilter
) {
  if (filter === "all") return true;
  if (filter === "needs_review") return paymentNeedsReview(payment);
  if (filter === "paid") return payment.status === "paid" && Boolean(payment.verifiedAt);
  if (filter === "pending_payout") {
    return (
      payment.status === "paid" &&
      (payment.payoutStatus || "pending_payout") === "pending_payout"
    );
  }
  if (filter === "settled") {
    return payment.payoutStatus === "settled" || Boolean(payment.settledAt);
  }
  if (filter === "refunded") return payment.refundStatus === "refunded";
  if (filter === "failed") return payment.status === "failed";
  return true;
}

export function PartnerPaymentsPage({
  verificationOnly = false,
}: {
  verificationOnly?: boolean;
}) {
  const [items, setItems] = React.useState<PartnerPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<PartnerPaymentFilter>(
    verificationOnly ? "needs_review" : "all"
  );
  const { snack, setSnack, close } = useSnack();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentsService.getPayments();
      setItems(response.items);
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดการชำระเงินไม่สำเร็จ", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [setSnack]);

  React.useEffect(() => {
    load();
  }, [load]);

  usePartnerRealtimeRefresh({
    events: ["payment.created", "payment.updated", "booking.updated"],
    onRefresh: load,
  });

  async function runAction(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      setSnack({ open: true, message, severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "อัปเดตการชำระเงินไม่สำเร็จ", severity: "error" });
    }
  }

  const filteredItems = React.useMemo(
    () => items.filter((payment) => matchesPaymentFilter(payment, filter)),
    [filter, items]
  );

  return (
    <Box className="partner-page">
      <SectionHeader
        title="การชำระเงิน"
        description="ตรวจสอบรายการชำระเงิน ยืนยันสลิป คืนเงิน และปิดยอดเข้าร้านได้ในหน้าเดียว"
        action={
          <TextField
            select
            size="small"
            label="สถานะ"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as PartnerPaymentFilter)
            }
            className="w-full md:w-56"
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="needs_review">รอตรวจสอบ</MenuItem>
            <MenuItem value="paid">ชำระแล้ว</MenuItem>
            <MenuItem value="pending_payout">รอปิดยอด</MenuItem>
            <MenuItem value="settled">ปิดยอดแล้ว</MenuItem>
            <MenuItem value="refunded">คืนเงินแล้ว</MenuItem>
            <MenuItem value="failed">ไม่สำเร็จ</MenuItem>
          </TextField>
        }
      />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-0!">
            {filteredItems.length === 0 ? <EmptyState label="ยังไม่มีรายการชำระเงินในสถานะนี้" /> : filteredItems.map((payment, index) => (
              <Box key={payment.id}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="items-start justify-between p-4">
                  <Box>
                    <Typography className="font-black text-slate-950">{payment.bookingCode || payment.bookingId} • {payment.customerName || "-"}</Typography>
                    <Typography className="text-sm text-slate-600">
                      {paymentMethodLabel(payment.method)} • {payment.transactionId || "-"}
                    </Typography>
                    <Typography className="mt-1 font-bold text-slate-900">{formatTHB(payment.amount)}</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="mt-2">
                      <Chip
                        label={`ชำระเงิน: ${statusLabel(payment.status)}`}
                        className={statusChipClass(payment.status)}
                      />
                      <Chip
                        label={`ปิดยอด: ${statusLabel(payment.payoutStatus || "pending_payout")}`}
                        className={statusChipClass(payment.payoutStatus || "pending_payout")}
                      />
                      <Chip
                        label={`คืนเงิน: ${statusLabel(payment.refundStatus || "none")}`}
                        className={statusChipClass(payment.refundStatus || "none")}
                      />
                    </Stack>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} className="w-full md:w-auto">
                    <Button
                      variant="outlined"
                      disabled={!paymentNeedsReview(payment)}
                      onClick={() => runAction(() => paymentsService.verifyPayment(payment.id), "ยืนยันชำระเงินแล้ว")}
                    >
                      ยืนยัน
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={payment.status !== "paid" || payment.payoutStatus === "settled"}
                      onClick={() => runAction(() => paymentsService.settlePayment(payment.id), "ปิดยอดเข้าร้านแล้ว")}
                    >
                      ปิดยอด
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      disabled={payment.refundStatus === "refunded"}
                      onClick={() => runAction(() => paymentsService.refundPayment(payment.id, payment.amount), "คืนเงินแล้ว")}
                    >
                      คืนเงิน
                    </Button>
                  </Stack>
                </Stack>
                {index < filteredItems.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

export function PartnerCustomersPage() {
  const [items, setItems] = React.useState<PartnerCustomer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();
  React.useEffect(() => {
    customersService.getCustomers().then((response) => setItems(response.items)).catch((error: unknown) => setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดลูกค้าไม่สำเร็จ", severity: "error" })).finally(() => setLoading(false));
  }, [setSnack]);
  return (
    <Box className="partner-page">
      <SectionHeader title="ลูกค้า" description="รวมลูกค้าจากประวัติการจองจริงของร้าน" />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-0!">
            {items.length === 0 ? <EmptyState label="ยังไม่มีลูกค้า" /> : items.map((customer, index) => (
              <Box key={`${customer.email}-${customer.phone}`}>
                <Stack direction={{ xs: "column", md: "row" }} className="justify-between p-4" spacing={1}>
                  <Box>
                    <Typography className="font-black text-slate-950">{customer.name}</Typography>
                    <Typography className="text-sm text-slate-600">{customer.email || "-"} • {customer.phone || "-"}</Typography>
                    <Typography className="text-xs text-slate-500">จองล่าสุด {formatDate(customer.lastBookingAt)}</Typography>
                  </Box>
                  <Typography className="font-bold text-slate-900">{customer.bookings} จอง • {formatTHB(customer.totalAmount)}</Typography>
                </Stack>
                {index < items.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

export function PartnerReportsPage() {
  const [report, setReport] = React.useState<PartnerDashboard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();
  React.useEffect(() => {
    reportsService.getReports().then(setReport).catch((error: unknown) => setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดรายงานไม่สำเร็จ", severity: "error" })).finally(() => setLoading(false));
  }, [setSnack]);
  if (loading) return <LoadingCard />;
  return (
    <Box className="partner-page">
      <SectionHeader title="รายงาน" description="สรุปยอดขาย การจอง รถ สาขา และรีวิวของร้าน" />
      {report ? (
        <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="รถทั้งหมด" value={report.summary.totalCars} detail={`พร้อมให้เช่า ${report.summary.availableCars}`} />
          <Metric label="การจอง" value={report.summary.totalBookings} detail={`รับรถวันนี้ ${report.summary.todayPickups}`} />
          <Metric label="รายได้" value={formatTHB(report.summary.totalRevenue)} detail="ยอดที่ชำระแล้ว" />
          <Metric label="รีวิว" value={report.summary.totalReviews} detail={`สาขาเปิด ${report.summary.activeBranches}`} />
        </Box>
      ) : <EmptyState label="ยังไม่มีรายงาน" />}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

function Metric({ label, value, detail }: { label: string; value: React.ReactNode; detail: string }) {
  return (
    <Card elevation={0} className="partner-card rounded-[30px]!">
      <CardContent>
        <Typography className="text-sm text-slate-500">{label}</Typography>
        <Typography className="mt-2 text-2xl font-black text-slate-950">{value}</Typography>
        <Typography className="text-xs text-slate-500">{detail}</Typography>
      </CardContent>
    </Card>
  );
}

export function PartnerCalendarPage() {
  const [bookings, setBookings] = React.useState<PartnerBooking[]>([]);
  const [blocks, setBlocks] = React.useState<PartnerAvailabilityBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("maintenance");
  const { snack, setSnack, close } = useSnack();
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await calendarService.getCalendar();
      setBookings(response.bookings);
      setBlocks(response.blocks);
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดปฏิทินไม่สำเร็จ", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [setSnack]);
  React.useEffect(() => { load(); }, [load]);
  usePartnerRealtimeRefresh({
    events: [
      "booking.created",
      "booking.updated",
      "booking.cancelled",
      "car.status.changed",
      "availability.changed",
    ],
    onRefresh: load,
  });
  async function createBlock() {
    if (!startDate || !endDate) {
      setSnack({ open: true, message: "กรุณาเลือกวันเริ่มต้นและวันสิ้นสุด", severity: "info" });
      return;
    }
    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      setSnack({ open: true, message: "วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น", severity: "info" });
      return;
    }
    try {
      await calendarService.createAvailabilityBlock({
        startDate,
        endDate,
        reason,
        blockType: "manual",
      });
      setStartDate("");
      setEndDate("");
      setSnack({ open: true, message: "เพิ่มวันปิดรับจองแล้ว", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "เพิ่มวันปิดรับจองไม่สำเร็จ", severity: "error" });
    }
  }
  return (
    <Box className="partner-page">
      <SectionHeader title="ปฏิทิน" description="ดูตารางจองและปิดช่วงวันที่ร้านไม่ว่าง" />
      <Card elevation={0} className="partner-card rounded-[30px]!">
        <CardContent>
          <Typography className="mb-3 font-black text-slate-950">เพิ่มวันปิดรับจอง</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField type="datetime-local" label="เริ่ม" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField type="datetime-local" label="สิ้นสุด" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="เหตุผล" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />
            <Button variant="contained" onClick={createBlock} sx={{ bgcolor: "rgb(15 23 42)" }}>เพิ่ม</Button>
          </Stack>
        </CardContent>
      </Card>
      {loading ? <LoadingCard /> : (
        <Box className="grid gap-4 xl:grid-cols-2">
          <ListCard title="รายการจอง" empty="ยังไม่มีรายการจอง" items={bookings.map((booking) => ({ id: booking.id, title: `${booking.bookingCode} • ${booking.customerName}`, subtitle: `${booking.carName || booking.carId} • ${formatDate(booking.pickupDate)} - ${formatDate(booking.returnDate)}`, right: bookingStatusLabel(booking.status) }))} />
          <ListCard title="วันปิดรับจอง" empty="ยังไม่มีวันปิดรับจอง" items={blocks.map((block) => ({ id: block.id, title: block.reason, subtitle: `${formatDate(block.startDate)} - ${formatDate(block.endDate)}`, right: "ลบ", onClick: async () => { await calendarService.deleteAvailabilityBlock(block.id); load(); } }))} />
        </Box>
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

function ListCard({ title, empty, items }: { title: string; empty: string; items: Array<{ id: string; title: string; subtitle?: string; right?: string; onClick?: () => void | Promise<void> }> }) {
  return (
    <Card elevation={0} className="partner-card rounded-[30px]!">
      <CardContent>
        <Typography className="font-black text-slate-950">{title}</Typography>
        {items.length === 0 ? <EmptyState label={empty} /> : <Stack divider={<Divider />} className="mt-3">{items.map((item) => <Stack key={item.id} direction={{ xs: "column", sm: "row" }} className="justify-between py-3" spacing={2}><Box><Typography className="font-bold text-slate-950">{item.title}</Typography><Typography className="text-sm text-slate-500">{item.subtitle}</Typography></Box>{item.right ? (item.onClick ? <Button size="small" onClick={item.onClick}>{item.right}</Button> : <Chip label={item.right} className={statusChipClass(item.right)} />) : null}</Stack>)}</Stack>}
      </CardContent>
    </Card>
  );
}

export function PartnerPromotionsPage() {
  return <CrudPage<PartnerPromotion> title="โปรโมชัน" description="จัดการคูปองและส่วนลด" load={promotionsService.listPromotions} create={promotionsService.createPromotion} update={promotionsService.updatePromotion} remove={promotionsService.deletePromotion} defaults={{ code: "", name: "", description: "", discountType: "percent", discountValue: 0, isActive: true }} fields={["code", "name", "description", "discountType", "discountValue"]} realtimeEvents={["promotion.changed"]} />;
}

export function PartnerAddonsPage() {
  return <CrudPage<PartnerAddon> title="บริการเสริม" description="จัดการอุปกรณ์หรือบริการที่คิดเงินเพิ่ม" load={addonsService.listAddons} create={addonsService.createAddon} update={addonsService.updateAddon} remove={addonsService.deleteAddon} defaults={{ name: "", description: "", price: 0, unit: "day", isActive: true }} fields={["name", "description", "price", "unit"]} realtimeEvents={["addon.changed"]} />;
}

export function PartnerLeadsPage() {
  return <CrudPage<PartnerLead> title="ลีด" description="ติดตามลูกค้าที่สนใจเช่ารถ" load={leadsService.listLeads} create={leadsService.createLead} update={leadsService.updateLead} remove={leadsService.deleteLead} defaults={{ name: "", email: "", phone: "", source: "", status: "new", interestedCar: "", note: "" }} fields={["name", "email", "phone", "source", "status", "interestedCar", "note"]} realtimeEvents={["lead.changed"]} />;
}

type CrudBase = { id: string; name?: string; code?: string; isActive?: boolean };

function CrudPage<T extends CrudBase>({
  title,
  description,
  load,
  create,
  update,
  remove,
  defaults,
  fields,
  realtimeEvents = [],
}: {
  title: string;
  description: string;
  load: () => Promise<{ items: T[]; total: number }>;
  create: (input: Omit<T, "id" | "createdAt">) => Promise<T>;
  update: (id: string, input: Omit<T, "id" | "createdAt">) => Promise<T>;
  remove: (id: string) => Promise<null>;
  defaults: Omit<T, "id" | "createdAt">;
  fields: Array<keyof Omit<T, "id" | "createdAt">>;
  realtimeEvents?: PartnerRealtimeEventType[];
}) {
  const [items, setItems] = React.useState<T[]>([]);
  const [form, setForm] = React.useState<Omit<T, "id" | "createdAt">>(defaults);
  const [editingId, setEditingId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();
  const reload = React.useCallback(async () => {
    setLoading(true);
    try { setItems((await load()).items); } catch (error: unknown) { setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ", severity: "error" }); } finally { setLoading(false); }
  }, [load, setSnack]);
  React.useEffect(() => { reload(); }, [reload]);
  usePartnerRealtimeRefresh({
    events: realtimeEvents,
    onRefresh: reload,
    enabled: realtimeEvents.length > 0,
  });
  async function save() {
    try {
      if (editingId) await update(editingId, form); else await create(form);
      setSnack({ open: true, message: "บันทึกสำเร็จ", severity: "success" });
      setEditingId("");
      setForm(defaults);
      reload();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ", severity: "error" });
    }
  }
  return (
    <Box className="partner-page">
      <SectionHeader title={title} description={description} />
      <Card elevation={0} className="partner-card rounded-[30px]!">
        <CardContent className="p-5!">
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            {fields.map((field) => (
              (() => {
                const key = String(field);
                const options = fieldOptions(key);
                return (
                  <TextField
                    key={key}
                    select={Boolean(options)}
                    label={fieldLabel(key)}
                    value={String(form[field] ?? "")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field]:
                          isNaN(Number(e.target.value)) || e.target.value === ""
                            ? e.target.value
                            : Number(e.target.value),
                      }))
                    }
                    fullWidth
                  >
                    {options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              })()
            ))}
            <Button variant="contained" onClick={save}>
              {editingId ? "บันทึก" : "เพิ่ม"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {loading ? (
        <LoadingCard />
      ) : (
        <ListCard
          title={title}
          empty="ยังไม่มีข้อมูล"
          items={items.map((item) => ({
            id: item.id,
            title: item.name || item.code || item.id,
            subtitle: item.isActive === false ? "ปิดใช้งาน" : "เปิดใช้งาน",
            right: "จัดการ",
            onClick: async () => {
              if (window.confirm("ต้องการลบรายการนี้ใช่หรือไม่ หากไม่ต้องการลบให้กดยกเลิกเพื่อแก้ไข")) {
                await remove(item.id);
                reload();
              } else {
                setEditingId(item.id);
                setForm(item as unknown as Omit<T, "id" | "createdAt">);
              }
            },
          }))}
        />
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}

export function PartnerSettingsProductionPage() {
  const [domains, setDomains] = React.useState<PartnerDomain[]>([]);
  const [members, setMembers] = React.useState<PartnerMember[]>([]);
  const [logs, setLogs] = React.useState<PartnerAuditLog[]>([]);
  const [domain, setDomain] = React.useState("");
  const [memberEmail, setMemberEmail] = React.useState("");
  const [memberName, setMemberName] = React.useState("");
  const [memberRole, setMemberRole] = React.useState<PartnerMember["role"]>("staff");
  const [memberPermissions, setMemberPermissions] = React.useState<string[]>([
    "cars.write",
    "branches.write",
    "bookings.write",
  ]);
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [domainData, memberData, auditData] = await Promise.all([
        domainsService.listDomains(),
        membersService.listMembers(),
        auditService.listAuditLogs(),
      ]);
      setDomains(domainData.items);
      setMembers(memberData.items);
      setLogs(auditData.items);
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดการตั้งค่าไม่สำเร็จ", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [setSnack]);
  React.useEffect(() => { load(); }, [load]);
  async function addDomain() {
    try { await domainsService.createDomain(domain); setDomain(""); load(); } catch (error: unknown) { setSnack({ open: true, message: error instanceof Error ? error.message : "เพิ่มโดเมนไม่สำเร็จ", severity: "error" }); }
  }
  async function addMember() {
    try {
      await membersService.createMember({
        email: memberEmail,
        name: memberName,
        role: memberRole,
        permissions: memberRole === "owner" ? ["*"] : memberPermissions,
      });
      setMemberEmail("");
      setMemberName("");
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "เพิ่มทีมไม่สำเร็จ", severity: "error" });
    }
  }
  function toggleMemberPermission(permission: string) {
    setMemberPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }
  async function updateMemberStatus(member: PartnerMember, status: string) {
    try {
      await membersService.updateMember(member.id, {
        email: member.email,
        name: member.name,
        role: member.role,
        permissions: member.permissions || [],
        status,
      });
      setSnack({ open: true, message: "อัปเดตทีมสำเร็จ", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "อัปเดตทีมไม่สำเร็จ", severity: "error" });
    }
  }
  return (
    <Box className="partner-page">
      <SectionHeader
        title="ตั้งค่าระบบร้าน"
        description="จัดการโดเมนของร้าน ทีมงาน และประวัติการเปลี่ยนแปลง"
      />
      {loading ? <LoadingCard /> : (
        <Box className="grid gap-4 xl:grid-cols-3">
          <Card elevation={0} className="partner-card rounded-[30px]!">
            <CardContent className="p-5!">
              <Typography className="partner-section-title">โดเมนเพิ่มเติม</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} className="my-4">
                <TextField
                  label="ชื่อโดเมน"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  fullWidth
                />
                <Button onClick={addDomain}>เพิ่ม</Button>
              </Stack>
              <Stack divider={<Divider />}>
                {domains.map((item) => (
                  <Box key={item.id} className="py-3">
                    <Stack spacing={1}>
                      <Typography className="font-bold text-slate-950">{item.domain}</Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip
                          label={statusLabel(item.status)}
                          className={statusChipClass(item.status)}
                        />
                        {item.verificationTxt ? (
                          <Chip
                            label={`รหัสยืนยัน: ${item.verificationTxt}`}
                            className="partner-chip"
                          />
                        ) : null}
                      </Stack>
                      <Button size="small" onClick={() => domainsService.verifyDomain(item.id).then(load)}>
                        ตรวจสอบโดเมน
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} className="partner-card rounded-[30px]!">
            <CardContent className="p-5!">
              <Typography className="partner-section-title">ทีมและสิทธิ์</Typography>
              <Stack spacing={1.5} className="my-4">
                <TextField
                  label="อีเมล"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="ชื่อทีมงาน"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    select
                    label="บทบาท"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as PartnerMember["role"])}
                    fullWidth
                  >
                    <MenuItem value="staff">พนักงาน</MenuItem>
                    <MenuItem value="support">ดูแลลูกค้า</MenuItem>
                    <MenuItem value="finance">การเงิน</MenuItem>
                    <MenuItem value="owner">เจ้าของร้าน</MenuItem>
                  </TextField>
                  <Button onClick={addMember}>เพิ่ม</Button>
                </Stack>
                {memberRole !== "owner" ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {PARTNER_PERMISSION_OPTIONS.map((permission) => {
                      const active = memberPermissions.includes(permission.key);
                      return (
                        <Button
                          key={permission.key}
                          size="small"
                          variant={active ? "contained" : "outlined"}
                          onClick={() => toggleMemberPermission(permission.key)}
                          className="rounded-full!"
                        >
                          {permission.label}
                        </Button>
                      );
                    })}
                  </Stack>
                ) : null}
              </Stack>
              <Stack divider={<Divider />}>
                {members.map((item) => (
                  <Box key={item.id} className="py-3">
                    <Typography className="font-bold text-slate-950">{item.email}</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="mt-2">
                      <Chip label={roleLabel(item.role)} className="partner-chip partner-chip-blue" />
                      <Chip label={statusLabel(item.status)} className={statusChipClass(item.status)} />
                      {(item.permissions || []).slice(0, 6).map((permission) => (
                        <Chip key={`${item.id}-${permission}`} label={permission === "*" ? "ทุกสิทธิ์" : permission} className="partner-chip" />
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} className="mt-3">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateMemberStatus(item, item.status === "active" ? "inactive" : "active")}
                      >
                        {item.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={async () => {
                          await membersService.deleteMember(item.id);
                          load();
                        }}
                      >
                        ลบ
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} className="partner-card rounded-[30px]!">
            <CardContent className="p-5!">
              <Typography className="partner-section-title">ประวัติการเปลี่ยนแปลง</Typography>
              <Stack divider={<Divider />} className="mt-3">
                {logs.map((item) => (
                  <Box key={item.id} className="py-3">
                    <Typography className="font-bold text-slate-950">
                      {auditActionLabel(item.action)}
                    </Typography>
                    <Typography className="text-xs text-slate-500">
                      {item.actorEmail || "ไม่ระบุผู้ทำรายการ"} • {formatDate(item.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}
