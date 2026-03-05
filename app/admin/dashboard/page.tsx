"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Button,
  Chip,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type BookingRow = {
  id: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  customerName: string;
  totalPrice: number;
  status: BookingStatus;
};

type StatusDonutRow = {
  name: string;
  value: number;
  key: BookingStatus;
};

type SalesRow = { day: string; bookings: number; revenue: number };

const BOOKINGS_LATEST: BookingRow[] = [
  {
    id: "BK-1004",
    carName: "BMW i5 eDrive40 M Sport",
    pickupDate: "2026-03-04",
    returnDate: "2026-03-06",
    customerName: "Pachara",
    totalPrice: 1590 * 2,
    status: "pending",
  },
  {
    id: "BK-1003",
    carName: "BMW M3 CS",
    pickupDate: "2026-03-03",
    returnDate: "2026-03-05",
    customerName: "Pachara",
    totalPrice: 1990 * 2,
    status: "confirmed",
  },
  {
    id: "BK-1002",
    carName: "BMW 330e M Sport",
    pickupDate: "2026-03-02",
    returnDate: "2026-03-04",
    customerName: "Somchai",
    totalPrice: 1490 * 2,
    status: "pending",
  },
  {
    id: "BK-1001",
    carName: "BMW 320d M Sport",
    pickupDate: "2026-03-01",
    returnDate: "2026-03-03",
    customerName: "Pachara",
    totalPrice: 1290 * 2,
    status: "confirmed",
  },
];

const SALES_SERIES: SalesRow[] = [
  { day: "จ.", bookings: 6, revenue: 6900 },
  { day: "อ.", bookings: 9, revenue: 11200 },
  { day: "พ.", bookings: 7, revenue: 9100 },
  { day: "พฤ.", bookings: 11, revenue: 13800 },
  { day: "ศ.", bookings: 8, revenue: 9800 },
  { day: "ส.", bookings: 12, revenue: 15600 },
  { day: "อา.", bookings: 10, revenue: 12900 },
];

const STATUS_DONUT: StatusDonutRow[] = [
  { name: "ยืนยันแล้ว", value: 18, key: "confirmed" },
  { name: "รอดำเนินการ", value: 7, key: "pending" },
  { name: "เสร็จสิ้น", value: 5, key: "completed" },
  { name: "ยกเลิก", value: 2, key: "cancelled" },
];

// โทนสีเรียบแบบ Slate/Emerald (ตั้งเองได้)
const PIE_COLORS = ["#0f172a", "#64748b", "#334155", "#e2e8f0"];

function formatTHB(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  const num = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(
    value
  );
  return `${num} บาท`;
}

function formatCompact(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  if (v >= 1_000_000) return `${Math.round(v / 100_000) / 10}M`;
  if (v >= 1_000) return `${Math.round(v / 100) / 10}k`;
  return `${v}`;
}

function StatusChip({ s }: { s: BookingStatus }) {
  const map: Record<
    BookingStatus,
    { label: string; color?: "success" | "warning" | "error" | "info" }
  > = {
    pending: { label: "รอดำเนินการ", color: "warning" },
    confirmed: { label: "ยืนยันแล้ว", color: "success" },
    cancelled: { label: "ยกเลิก", color: "error" },
    completed: { label: "เสร็จสิ้น", color: "info" },
  };

  const m = map[s];

  return (
    <Chip
      size="small"
      label={m.label}
      variant="outlined"
      color={m.color}
      sx={{ borderRadius: 2 }}
    />
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
      <CardContent className="p-5">
        <Stack direction="row" spacing={1.25} className="items-start justify-between">
          <Box>
            <Typography className="text-xs text-slate-500">{title}</Typography>
            <Typography className="mt-1 text-2xl font-extrabold text-slate-900">
              {value}
            </Typography>
            <Typography className="mt-1 text-xs text-slate-500">{sub}</Typography>
          </Box>

          <Box className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-900">
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const bks = payload.find((p) => p.dataKey === "bookings")?.value ?? 0;
  const rev = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;

  return (
    <Box className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Typography className="text-xs font-semibold text-slate-900">{label}</Typography>
      <Typography className="mt-1 text-xs text-slate-600">
        การจอง: <span className="font-semibold text-slate-900">{bks}</span>
      </Typography>
      <Typography className="text-xs text-slate-600">
        รายได้: <span className="font-semibold text-slate-900">{formatTHB(rev)}</span>
      </Typography>
    </Box>
  );
}

/* -------------------- Page -------------------- */
export default function AdminDashboardPage() {
  const totalBookings = React.useMemo(
    () => STATUS_DONUT.reduce((a, b) => a + b.value, 0),
    []
  );

  // mock KPI (ภายหลังเปลี่ยนเป็น API)
  const todayBookings = 12;
  const todayRevenue = 15600;
  const availableCars = 8;
  const pendingPayments = 4;

  return (
    <Box className="grid gap-4">
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="items-start md:items-center justify-between"
      >
        <Box>
          <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
            แดชบอร์ด
          </Typography>
          <Typography className="text-sm text-slate-600">
            ภาพรวมสถิติการจอง รายได้ และงานที่ต้องจัดการวันนี้
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} className="flex-wrap">
          <Button
            component={Link}
            href="/admin/bookings"
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              textTransform: "none",
              borderColor: "rgb(226 232 240)",
              color: "rgb(15 23 42)",
              "&:hover": { bgcolor: "rgb(248 250 252)" },
              borderRadius: 2,
            }}
          >
            ไปหน้าการจอง
          </Button>

          <Button
            component={Link}
            href="/admin/cars"
            variant="contained"
            size="small"
            sx={{
              textTransform: "none",
              bgcolor: "rgb(15 23 42)",
              boxShadow: "none",
              "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
              borderRadius: 2,
            }}
          >
            จัดการรถ
          </Button>
        </Stack>
      </Stack>

      {/* Quick actions (เน้น UX: ทางลัดงานสำคัญ) */}
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
        <CardContent className="p-5">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            className="items-start sm:items-center justify-between"
          >
            <Box>
              <Typography className="text-sm font-bold text-slate-900">
                ทางลัดงานด่วน
              </Typography>
              <Typography className="mt-1 text-xs text-slate-500">
                เปิดหน้าที่ใช้บ่อยเพื่อลดคลิก
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} className="flex-wrap">
              <Button
                component={Link}
                href="/admin/payment-verification"
                size="small"
                variant="outlined"
                startIcon={<FactCheckRoundedIcon fontSize="small" />}
                sx={{
                  textTransform: "none",
                  borderColor: "rgb(226 232 240)",
                  borderRadius: 2,
                }}
              >
                ตรวจสลิป
              </Button>
              <Button
                component={Link}
                href="/admin/leads"
                size="small"
                variant="outlined"
                startIcon={<ForumRoundedIcon fontSize="small" />}
                sx={{
                  textTransform: "none",
                  borderColor: "rgb(226 232 240)",
                  borderRadius: 2,
                }}
              >
                จองผ่านแชท
              </Button>
              <Button
                component={Link}
                href="/admin/addons"
                size="small"
                variant="outlined"
                startIcon={<ExtensionRoundedIcon fontSize="small" />}
                sx={{
                  textTransform: "none",
                  borderColor: "rgb(226 232 240)",
                  borderRadius: 2,
                }}
              >
                Add-ons
              </Button>
              <Button
                component={Link}
                href="/admin/locations"
                size="small"
                variant="outlined"
                startIcon={<PlaceRoundedIcon fontSize="small" />}
                sx={{
                  textTransform: "none",
                  borderColor: "rgb(226 232 240)",
                  borderRadius: 2,
                }}
              >
                สาขา/จุดรับ-ส่ง
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* KPI */}
      <Box className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="การจองวันนี้"
          value={`${todayBookings}`}
          sub="เทียบกับสัปดาห์นี้"
          icon={<CalendarMonthRoundedIcon fontSize="small" />}
        />
        <KpiCard
          title="รายได้วันนี้"
          value={formatTHB(todayRevenue)}
          sub="รวมค่าบริการทั้งหมด"
          icon={<PaymentsRoundedIcon fontSize="small" />}
        />
        <KpiCard
          title="รถพร้อมให้เช่า"
          value={`${availableCars}`}
          sub="จากรถทั้งหมดในระบบ"
          icon={<DirectionsCarRoundedIcon fontSize="small" />}
        />
        <KpiCard
          title="รอชำระ/ตรวจสอบ"
          value={`${pendingPayments}`}
          sub="ควรตรวจสอบวันนี้"
          icon={<TrendingUpRoundedIcon fontSize="small" />}
        />
      </Box>

      {/* Charts */}
      <Box className="grid gap-4 lg:grid-cols-3">
        {/* Line chart */}
        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white lg:col-span-2">
          <CardContent className="p-5">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              className="items-start sm:items-center justify-between"
            >
              <Box>
                <Typography className="text-sm font-bold text-slate-900">
                  สรุป 7 วันล่าสุด
                </Typography>
                <Typography className="mt-1 text-xs text-slate-500">
                  การจอง (เส้น) และรายได้ (เส้น) ตามวัน
                </Typography>
              </Box>

              <Chip size="small" label="7 วันล่าสุด" variant="outlined" sx={{ borderRadius: 2 }} />
            </Stack>

            <Box className="mt-4 h-65 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SALES_SERIES} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickMargin={8} />
                  <YAxis
                    yAxisId="left"
                    tickMargin={8}
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickMargin={8}
                    tickFormatter={(v) => formatCompact(Number(v))}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Donut */}
        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
          <CardContent className="p-5">
            <Typography className="text-sm font-bold text-slate-900">
              สถานะการจอง
            </Typography>
            <Typography className="mt-1 text-xs text-slate-500">
              รวมทั้งหมด {totalBookings} รายการ
            </Typography>

            <Box className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DONUT}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {STATUS_DONUT.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} รายการ`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Stack spacing={1} className="mt-2">
              {STATUS_DONUT.map((s, i) => (
                <Box key={s.key} className="flex items-center justify-between">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Box
                      className="h-2.5 w-2.5 rounded-full"
                      sx={{ bgcolor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <Typography className="text-xs text-slate-600">{s.name}</Typography>
                  </Stack>
                  <Typography className="text-xs font-semibold text-slate-900">
                    {s.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Latest bookings */}
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
        <CardContent className="p-0">
          <Box className="p-5">
            <Stack direction="row" className="items-center justify-between">
              <Box>
                <Typography className="text-sm font-bold text-slate-900">
                  การจองล่าสุด
                </Typography>
                <Typography className="mt-1 text-xs text-slate-500">
                  แสดงรายการล่าสุดเพื่อจัดการได้เร็ว
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/admin/bookings"
                size="small"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderColor: "rgb(226 232 240)",
                  borderRadius: 2,
                }}
              >
                ดูทั้งหมด
              </Button>
            </Stack>
          </Box>

          <Divider className="border-slate-200!" />

          <Box className="grid">
            {BOOKINGS_LATEST.map((b, idx) => (
              <Box key={b.id}>
                <Box className="p-4 sm:p-5">
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    className="items-start md:items-center justify-between"
                  >
                    <Box className="min-w-0">
                      <Stack direction="row" spacing={1} className="items-center flex-wrap">
                        <Typography className="text-sm font-bold text-slate-900">
                          {b.id}
                        </Typography>
                        <StatusChip s={b.status} />
                      </Stack>

                      <Typography className="mt-1 text-sm text-slate-700 truncate">
                        {b.carName}
                      </Typography>
                      <Typography className="mt-1 text-xs text-slate-500">
                        ผู้จอง: {b.customerName} • รับ: {b.pickupDate} • คืน: {b.returnDate}
                      </Typography>
                    </Box>

                    <Stack spacing={1} className="w-full md:w-auto">
                      <Box className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:w-64">
                        <Typography className="text-xs text-slate-500">ยอดรวม</Typography>
                        <Typography className="text-sm font-semibold text-slate-900">
                          {formatTHB(b.totalPrice)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} className="justify-end">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            textTransform: "none",
                            borderColor: "rgb(226 232 240)",
                            borderRadius: 2,
                          }}
                        >
                          รายละเอียด
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            bgcolor: "rgb(15 23 42)",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
                            borderRadius: 2,
                          }}
                        >
                          จัดการ
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                {idx !== BOOKINGS_LATEST.length - 1 ? (
                  <Divider className="border-slate-200!" />
                ) : null}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}