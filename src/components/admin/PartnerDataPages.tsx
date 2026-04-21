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
import { paymentsService } from "@/src/services/payments/payments.service";
import type { PartnerPayment } from "@/src/services/payments/payments.types";
import { promotionsService } from "@/src/services/promotions/promotions.service";
import type { PartnerPromotion } from "@/src/services/promotions/promotions.types";
import { reportsService } from "@/src/services/reports/reports.service";

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
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
  };
  return labels[status] || status;
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
      className="items-start justify-between md:items-center"
    >
      <Box>
        <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
          {title}
        </Typography>
        <Typography className="text-sm text-slate-600">{description}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
      <CardContent className="grid min-h-72 place-items-center">
        <CircularProgress />
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Box className="grid min-h-56 place-items-center text-center">
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

  async function updateStatus(booking: PartnerBooking, nextStatus: string) {
    try {
      await bookingsService.updateBookingStatus(booking.id, nextStatus);
      setSnack({ open: true, message: "อัปเดตการจองสำเร็จ", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "อัปเดตการจองไม่สำเร็จ", severity: "error" });
    }
  }

  return (
    <Box className="grid gap-4">
      <SectionHeader
        title="การจอง"
        description="ดูและจัดการสถานะการจองของร้านจาก API จริง"
        action={
          <TextField select size="small" label="สถานะ" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full md:w-48">
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="pending">รอดำเนินการ</MenuItem>
            <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
            <MenuItem value="paid">ชำระแล้ว</MenuItem>
            <MenuItem value="completed">เสร็จสิ้น</MenuItem>
            <MenuItem value="cancelled">ยกเลิก</MenuItem>
          </TextField>
        }
      />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
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
                    <Chip label={bookingStatusLabel(booking.status)} variant="outlined" />
                    <TextField select size="small" label="เปลี่ยนสถานะ" defaultValue={booking.status} onChange={(e) => updateStatus(booking, e.target.value)} className="w-full sm:w-44">
                      <MenuItem value="pending">รอดำเนินการ</MenuItem>
                      <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
                      <MenuItem value="paid">ชำระแล้ว</MenuItem>
                      <MenuItem value="completed">เสร็จสิ้น</MenuItem>
                      <MenuItem value="cancelled">ยกเลิก</MenuItem>
                    </TextField>
                  </Stack>
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

export function PartnerPaymentsPage({ verificationOnly = false }: { verificationOnly?: boolean }) {
  const [items, setItems] = React.useState<PartnerPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentsService.getPayments();
      setItems(verificationOnly ? response.items.filter((item) => item.status !== "paid" || !item.verifiedAt) : response.items);
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดการชำระเงินไม่สำเร็จ", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [setSnack, verificationOnly]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function runAction(action: () => Promise<unknown>, message: string) {
    try {
      await action();
      setSnack({ open: true, message, severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "อัปเดตการชำระเงินไม่สำเร็จ", severity: "error" });
    }
  }

  return (
    <Box className="grid gap-4">
      <SectionHeader title={verificationOnly ? "ตรวจสอบการชำระเงิน" : "การชำระเงิน"} description="จัดการตรวจสลิป คืนเงิน และปิดยอดเข้าร้าน" />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
          <CardContent className="p-0!">
            {items.length === 0 ? <EmptyState label="ยังไม่มีรายการชำระเงิน" /> : items.map((payment, index) => (
              <Box key={payment.id}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="items-start justify-between p-4">
                  <Box>
                    <Typography className="font-black text-slate-950">{payment.bookingCode || payment.bookingId} • {payment.customerName || "-"}</Typography>
                    <Typography className="text-sm text-slate-600">{payment.method} • {payment.transactionId || "-"}</Typography>
                    <Typography className="mt-1 font-bold text-slate-900">{formatTHB(payment.amount)}</Typography>
                    <Typography className="text-xs text-slate-500">สถานะจ่าย: {payment.status} • payout: {payment.payoutStatus || "pending"} • refund: {payment.refundStatus || "none"}</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} className="w-full md:w-auto">
                    <Button variant="outlined" onClick={() => runAction(() => paymentsService.verifyPayment(payment.id, payment.slipUrl), "ยืนยันชำระเงินแล้ว")}>ยืนยัน</Button>
                    <Button variant="outlined" onClick={() => runAction(() => paymentsService.settlePayment(payment.id), "ปิดยอดเข้าร้านแล้ว")}>ปิดยอด</Button>
                    <Button color="error" variant="outlined" onClick={() => runAction(() => paymentsService.refundPayment(payment.id, payment.amount), "คืนเงินแล้ว")}>คืนเงิน</Button>
                  </Stack>
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

export function PartnerCustomersPage() {
  const [items, setItems] = React.useState<PartnerCustomer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { snack, setSnack, close } = useSnack();
  React.useEffect(() => {
    customersService.getCustomers().then((response) => setItems(response.items)).catch((error: unknown) => setSnack({ open: true, message: error instanceof Error ? error.message : "โหลดลูกค้าไม่สำเร็จ", severity: "error" })).finally(() => setLoading(false));
  }, [setSnack]);
  return (
    <Box className="grid gap-4">
      <SectionHeader title="ลูกค้า" description="รวมลูกค้าจากประวัติการจองจริงของร้าน" />
      {loading ? <LoadingCard /> : (
        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
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
    <Box className="grid gap-4">
      <SectionHeader title="รายงาน" description="สรุปยอดขาย การจอง รถ สาขา และรีวิวจาก API จริง" />
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
    <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
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
  async function createBlock() {
    try {
      await calendarService.createAvailabilityBlock({ startDate, endDate, reason });
      setSnack({ open: true, message: "เพิ่มวันปิดรับจองแล้ว", severity: "success" });
      load();
    } catch (error: unknown) {
      setSnack({ open: true, message: error instanceof Error ? error.message : "เพิ่มวันปิดรับจองไม่สำเร็จ", severity: "error" });
    }
  }
  return (
    <Box className="grid gap-4">
      <SectionHeader title="ปฏิทิน" description="ดูตารางจองและ block วันไม่ว่างของร้าน" />
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
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
    <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
      <CardContent>
        <Typography className="font-black text-slate-950">{title}</Typography>
        {items.length === 0 ? <EmptyState label={empty} /> : <Stack divider={<Divider />} className="mt-3">{items.map((item) => <Stack key={item.id} direction="row" className="justify-between py-3" spacing={2}><Box><Typography className="font-bold text-slate-950">{item.title}</Typography><Typography className="text-sm text-slate-500">{item.subtitle}</Typography></Box>{item.right ? <Button size="small" onClick={item.onClick}>{item.right}</Button> : null}</Stack>)}</Stack>}
      </CardContent>
    </Card>
  );
}

export function PartnerPromotionsPage() {
  return <CrudPage<PartnerPromotion> title="โปรโมชัน" description="จัดการคูปองและส่วนลด" load={promotionsService.listPromotions} create={promotionsService.createPromotion} update={promotionsService.updatePromotion} remove={promotionsService.deletePromotion} defaults={{ code: "", name: "", description: "", discountType: "percent", discountValue: 0, isActive: true }} fields={["code", "name", "description", "discountType", "discountValue"]} />;
}

export function PartnerAddonsPage() {
  return <CrudPage<PartnerAddon> title="บริการเสริม" description="จัดการอุปกรณ์หรือบริการที่คิดเงินเพิ่ม" load={addonsService.listAddons} create={addonsService.createAddon} update={addonsService.updateAddon} remove={addonsService.deleteAddon} defaults={{ name: "", description: "", price: 0, unit: "day", isActive: true }} fields={["name", "description", "price", "unit"]} />;
}

export function PartnerLeadsPage() {
  return <CrudPage<PartnerLead> title="ลีด" description="ติดตามลูกค้าที่สนใจเช่ารถ" load={leadsService.listLeads} create={leadsService.createLead} update={leadsService.updateLead} remove={leadsService.deleteLead} defaults={{ name: "", email: "", phone: "", source: "", status: "new", interestedCar: "", note: "" }} fields={["name", "email", "phone", "source", "status", "interestedCar", "note"]} />;
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
}: {
  title: string;
  description: string;
  load: () => Promise<{ items: T[]; total: number }>;
  create: (input: Omit<T, "id" | "createdAt">) => Promise<T>;
  update: (id: string, input: Omit<T, "id" | "createdAt">) => Promise<T>;
  remove: (id: string) => Promise<null>;
  defaults: Omit<T, "id" | "createdAt">;
  fields: Array<keyof Omit<T, "id" | "createdAt">>;
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
    <Box className="grid gap-4">
      <SectionHeader title={title} description={description} />
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white"><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>{fields.map((field) => <TextField key={String(field)} label={String(field)} value={String(form[field] ?? "")} onChange={(e) => setForm((prev) => ({ ...prev, [field]: isNaN(Number(e.target.value)) || e.target.value === "" ? e.target.value : Number(e.target.value) }))} fullWidth />)}<Button variant="contained" onClick={save} sx={{ bgcolor: "rgb(15 23 42)" }}>{editingId ? "บันทึก" : "เพิ่ม"}</Button></Stack></CardContent></Card>
      {loading ? <LoadingCard /> : <ListCard title={title} empty="ยังไม่มีข้อมูล" items={items.map((item) => ({ id: item.id, title: item.name || item.code || item.id, subtitle: item.isActive === false ? "ปิดใช้งาน" : "เปิดใช้งาน", right: "แก้ไข/ลบ", onClick: async () => { if (window.confirm("กด OK เพื่อลบ หรือ Cancel เพื่อแก้ไข")) { await remove(item.id); reload(); } else { setEditingId(item.id); setForm(item as unknown as Omit<T, "id" | "createdAt">); } } }))} />}
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
  const [memberRole, setMemberRole] = React.useState<PartnerMember["role"]>("staff");
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
    try { await membersService.createMember({ email: memberEmail, role: memberRole }); setMemberEmail(""); load(); } catch (error: unknown) { setSnack({ open: true, message: error instanceof Error ? error.message : "เพิ่มทีมไม่สำเร็จ", severity: "error" }); }
  }
  return (
    <Box className="grid gap-4">
      <SectionHeader title="ตั้งค่าระบบร้าน" description="จัดการ custom domain, team roles และ audit log" />
      {loading ? <LoadingCard /> : (
        <Box className="grid gap-4 xl:grid-cols-3">
          <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white"><CardContent><Typography className="font-black">Custom domains</Typography><Stack direction="row" spacing={1} className="my-3"><TextField label="domain.com" value={domain} onChange={(e) => setDomain(e.target.value)} fullWidth /><Button onClick={addDomain}>เพิ่ม</Button></Stack><Stack divider={<Divider />}>{domains.map((item) => <Box key={item.id} className="py-2"><Typography className="font-bold">{item.domain}</Typography><Typography className="text-xs text-slate-500">{item.status} • TXT: {item.verificationTxt}</Typography><Button size="small" onClick={() => domainsService.verifyDomain(item.id).then(load)}>ยืนยัน</Button></Box>)}</Stack></CardContent></Card>
          <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white"><CardContent><Typography className="font-black">ทีมและสิทธิ์</Typography><Stack direction="row" spacing={1} className="my-3"><TextField label="อีเมล" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} fullWidth /><TextField select label="Role" value={memberRole} onChange={(e) => setMemberRole(e.target.value as PartnerMember["role"])}><MenuItem value="staff">staff</MenuItem><MenuItem value="finance">finance</MenuItem><MenuItem value="owner">owner</MenuItem></TextField><Button onClick={addMember}>เพิ่ม</Button></Stack><Stack divider={<Divider />}>{members.map((item) => <Box key={item.id} className="py-2"><Typography className="font-bold">{item.email}</Typography><Typography className="text-xs text-slate-500">{item.role} • {item.status}</Typography></Box>)}</Stack></CardContent></Card>
          <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white"><CardContent><Typography className="font-black">Audit logs</Typography><Stack divider={<Divider />} className="mt-3">{logs.map((item) => <Box key={item.id} className="py-2"><Typography className="font-bold">{item.action}</Typography><Typography className="text-xs text-slate-500">{item.actorEmail || "-"} • {formatDate(item.createdAt)}</Typography></Box>)}</Stack></CardContent></Card>
        </Box>
      )}
      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}
