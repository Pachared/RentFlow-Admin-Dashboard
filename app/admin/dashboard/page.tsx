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
  LinearProgress,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

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
  Legend,
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

type FleetRow = {
  label: string;
  value: number;
  color: string;
};

type UrgentTaskRow = {
  label: string;
  count: number;
  tone: "primary" | "success" | "warning" | "error";
  icon: React.ReactNode;
};

type PaymentRow = {
  label: string;
  count: number;
  amount: number;
  color: string;
};

type ActivityRow = {
  id: string;
  text: string;
  time: string;
};

type TopCarRow = {
  name: string;
  bookings: number;
  revenue: number;
};

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
  { day: "จ.", bookings: 4, revenue: 5200 },
  { day: "อ.", bookings: 6, revenue: 7600 },
  { day: "พ.", bookings: 5, revenue: 6800 },
  { day: "พฤ.", bookings: 8, revenue: 10200 },
  { day: "ศ.", bookings: 11, revenue: 14800 },
  { day: "ส.", bookings: 15, revenue: 19800 },
  { day: "อา.", bookings: 13, revenue: 17200 },
];

const STATUS_DONUT: StatusDonutRow[] = [
  { name: "ยืนยันแล้ว", value: 18, key: "confirmed" },
  { name: "รอดำเนินการ", value: 7, key: "pending" },
  { name: "เสร็จสิ้น", value: 5, key: "completed" },
  { name: "ยกเลิก", value: 2, key: "cancelled" },
];

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

const FLEET_STATUS: FleetRow[] = [
  { label: "พร้อมให้เช่า", value: 8, color: "#2563eb" },
  { label: "กำลังถูกจอง", value: 12, color: "#10b981" },
  { label: "ซ่อมบำรุง", value: 2, color: "#f59e0b" },
  { label: "ปิดใช้งาน", value: 1, color: "#ef4444" },
];

const URGENT_TASKS: UrgentTaskRow[] = [
  {
    label: "รับรถวันนี้",
    count: 6,
    tone: "primary",
    icon: <LocalShippingRoundedIcon fontSize="medium" />,
  },
  {
    label: "คืนรถวันนี้",
    count: 4,
    tone: "success",
    icon: <EventNoteRoundedIcon fontSize="medium" />,
  },
  {
    label: "รอตรวจสลิป",
    count: 3,
    tone: "warning",
    icon: <PaymentsOutlinedIcon fontSize="medium" />,
  },
  {
    label: "ต้องติดตาม",
    count: 2,
    tone: "error",
    icon: <WarningAmberRoundedIcon fontSize="medium" />,
  },
];

const PAYMENT_SUMMARY: PaymentRow[] = [
  { label: "ชำระแล้ว", count: 18, amount: 46500, color: "#10b981" },
  { label: "รอตรวจสอบ", count: 4, amount: 9200, color: "#f59e0b" },
  { label: "ค้างชำระ", count: 3, amount: 6900, color: "#ef4444" },
  { label: "คืนเงิน", count: 1, amount: 1200, color: "#64748b" },
];

const TOP_CARS: TopCarRow[] = [
  { name: "BMW 320d M Sport", bookings: 9, revenue: 23200 },
  { name: "BMW 330e M Sport", bookings: 7, revenue: 19800 },
  { name: "BMW i5 eDrive40 M Sport", bookings: 6, revenue: 21400 },
  { name: "BMW M3 CS", bookings: 4, revenue: 18600 },
];

const ACTIVITY_FEED: ActivityRow[] = [
  { id: "a1", text: "ยืนยันการจอง BK-1003 เรียบร้อยแล้ว", time: "10 นาทีที่แล้ว" },
  { id: "a2", text: "ลูกค้าอัปโหลดสลิปชำระเงิน BK-1004", time: "24 นาทีที่แล้ว" },
  { id: "a3", text: "รถ BMW 330e M Sport ถูกเปลี่ยนสถานะเป็นซ่อมบำรุง", time: "1 ชั่วโมงที่แล้ว" },
  { id: "a4", text: "มีการสร้างการจองใหม่ BK-1008", time: "2 ชั่วโมงที่แล้ว" },
];

const UPCOMING_PICKUPS = [
  { id: "BK-1006", customer: "Anan", car: "BMW X1", at: "09:30" },
  { id: "BK-1007", customer: "Ploy", car: "BMW 520d", at: "11:00" },
  { id: "BK-1008", customer: "Narin", car: "BMW 320d", at: "14:00" },
];

const UPCOMING_RETURNS = [
  { id: "BK-1001", customer: "Pachara", car: "BMW 320d M Sport", at: "13:30" },
  { id: "BK-1003", customer: "Pachara", car: "BMW M3 CS", at: "16:00" },
  { id: "BK-1009", customer: "Mint", car: "BMW X3", at: "18:30" },
];

function formatTHB(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  const num = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(value);
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
      size="medium"
      label={m.label}
      variant="outlined"
      color={m.color}
      sx={{ borderRadius: 2 }}
    />
  );
}

function UrgencyChip({ booking }: { booking: BookingRow }) {
  if (booking.status === "pending") {
    return (
      <Chip
        size="medium"
        label="ต้องตรวจสอบ"
        color="warning"
        sx={{ borderRadius: 2 }}
      />
    );
  }

  return (
    <Chip
      size="medium"
      label="รับรถวันนี้"
      color="info"
      variant="outlined"
      sx={{ borderRadius: 2 }}
    />
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon,
  iconColor = "rgb(37 99 235)",
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <Card
      elevation={0}
      className="rounded-2xl! border border-slate-200 bg-white"
    >
      <CardContent className="p-4!">
        <Stack direction="row" spacing={2} className="items-start justify-between">
          <Stack spacing={0.75}>
            <Typography className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: "1.75rem",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: "rgb(15 23 42)",
              }}
            >
              {value}
            </Typography>

            <Typography className="text-xs text-slate-500">{sub}</Typography>
          </Stack>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgb(226 232 240)",
              color: iconColor,
              flexShrink: 0,
            }}
          >
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

function SectionCard({
  title,
  sub,
  children,
  icon,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
      <CardContent className="p-5">
        <Stack direction="row" spacing={1.25} className="items-start">
          {icon ? (
            <Box
              sx={{
                mt: "2px",
                width: 34,
                height: 34,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgb(248 250 252)",
                border: "1px solid rgb(226 232 240)",
                color: "rgb(15 23 42)",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          ) : null}

          <Box sx={{ minWidth: 0 }}>
            <Typography className="text-sm font-bold text-slate-900">{title}</Typography>
            {sub ? (
              <Typography className="mt-1 text-xs text-slate-500">{sub}</Typography>
            ) : null}
          </Box>
        </Stack>

        <Box className="mt-4">{children}</Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const totalBookings = React.useMemo(
    () => STATUS_DONUT.reduce((a, b) => a + b.value, 0),
    []
  );

  const totalFleet = React.useMemo(
    () => FLEET_STATUS.reduce((sum, item) => sum + item.value, 0),
    []
  );

  const todayBookings = 12;
  const todayRevenue = 15600;
  const weeklyRevenue = 91600;
  const monthlyRevenue = 326400;
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
            ภาพรวมสถิติการจอง รายได้ การชำระเงิน และงานที่ต้องจัดการวันนี้
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} className="flex-wrap">
          <Chip label="วันนี้" color="primary" sx={{ borderRadius: 2 }} />
          <Chip label={`สัปดาห์นี้ ${formatTHB(weeklyRevenue)}`} variant="outlined" sx={{ borderRadius: 2 }} />
          <Chip label={`เดือนนี้ ${formatTHB(monthlyRevenue)}`} variant="outlined" sx={{ borderRadius: 2 }} />
        </Stack>
      </Stack>

      {/* KPI */}
      <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="การจองวันนี้"
          value={`${todayBookings} รายการ`}
          sub="เทียบกับแนวโน้มสัปดาห์นี้"
          icon={<CalendarMonthRoundedIcon fontSize="medium" />}
          iconColor="rgb(37 99 235)"
        />

        <KpiCard
          title="รายได้วันนี้"
          value={formatTHB(todayRevenue)}
          sub="รวมค่าบริการทั้งหมดวันนี้"
          icon={<PaymentsRoundedIcon fontSize="medium" />}
          iconColor="rgb(5 150 105)"
        />

        <KpiCard
          title="รถพร้อมให้เช่า"
          value={`${availableCars} คัน`}
          sub={`จากรถทั้งหมด ${totalFleet} คัน`}
          icon={<DirectionsCarRoundedIcon fontSize="medium" />}
          iconColor="rgb(124 58 237)"
        />

        <KpiCard
          title="รอชำระ/ตรวจสอบ"
          value={`${pendingPayments} รายการ`}
          sub="ควรตรวจสอบภายในวันนี้"
          icon={<TrendingUpRoundedIcon fontSize="medium" />}
          iconColor="rgb(217 119 6)"
        />
      </Box>

      {/* urgent + fleet + payment */}
      <Box className="grid gap-4 xl:grid-cols-3" >
        <SectionCard
          title="งานด่วนวันนี้"
          sub="รายการที่ทีมแอดมินควรจัดการก่อน"
          icon={<FactCheckRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1.25}>
            {URGENT_TASKS.map((task) => (
              <Box
                key={task.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <Stack direction="row" spacing={1.25} className="items-center">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "white",
                      border: "1px solid rgb(226 232 240)",
                    }}
                  >
                    {task.icon}
                  </Box>
                  <Typography className="text-sm font-medium text-slate-700">
                    {task.label}
                  </Typography>
                </Stack>

                <Chip
                  size="medium"
                  color={task.tone}
                  label={`${task.count} รายการ`}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="สถานะรถในระบบ"
          sub={`ภาพรวมรถทั้งหมด ${totalFleet} คัน`}
          icon={<BuildRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={2}>
            {FLEET_STATUS.map((item) => {
              const percent = totalFleet > 0 ? (item.value / totalFleet) * 100 : 0;

              return (
                <Box key={item.label}>
                  <Stack direction="row" className="items-center justify-between">
                    <Typography className="text-sm text-slate-700">{item.label}</Typography>
                    <Typography className="text-sm font-semibold text-slate-900">
                      {item.value} คัน
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={percent}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 999,
                      bgcolor: "rgb(241 245 249)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: item.color,
                        borderRadius: 999,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </SectionCard>

        <SectionCard
          title="สรุปการชำระเงิน"
          sub="แบ่งตามสถานะการชำระ"
          icon={<PaymentsRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1.25}>
            {PAYMENT_SUMMARY.map((item) => (
              <Box
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-3"
              >
                <Stack direction="row" className="items-center justify-between">
                  <Stack direction="row" spacing={1.25} className="items-center">
                    <Box
                      className="h-2.5 w-2.5 rounded-full"
                      sx={{ bgcolor: item.color }}
                    />
                    <Typography className="text-sm text-slate-700">{item.label}</Typography>
                  </Stack>

                  <Typography className="text-sm font-semibold text-slate-900">
                    {item.count} รายการ
                  </Typography>
                </Stack>

                <Typography className="mt-1 text-xs text-slate-500">
                  ยอดรวม {formatTHB(item.amount)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </Box>

      {/* charts */}
      <Box className="grid gap-4 lg:grid-cols-3">
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
                  แนวโน้มจำนวนการจองและรายได้รายวัน
                </Typography>
              </Box>

              <Chip size="medium" label="7 วันล่าสุด" variant="outlined" sx={{ borderRadius: 2 }} />
            </Stack>

            <Box className="mt-4 h-72 w-full">
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
                  <Legend />
                  <Line
                    name="การจอง"
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    activeDot={{ r: 5 }}
                    dot={false}
                  />
                  <Line
                    name="รายได้"
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    activeDot={{ r: 5 }}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
          <CardContent className="p-5">
            <Typography className="text-sm font-bold text-slate-900">
              สถานะการจอง
            </Typography>
            <Typography className="mt-1 text-xs text-slate-500">
              รวมทั้งหมด {totalBookings} รายการ
            </Typography>

            <Box className="relative mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DONUT}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={94}
                    paddingAngle={2}
                  >
                    {STATUS_DONUT.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} รายการ`, name]} />
                </PieChart>
              </ResponsiveContainer>

              <Box className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <Typography className="text-2xl font-black text-slate-900">
                  {totalBookings}
                </Typography>
                <Typography className="text-xs text-slate-500">
                  รายการทั้งหมด
                </Typography>
              </Box>
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

      {/* schedule preview + top cars */}
      <Box className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="รับรถวันนี้"
          sub="รายการรับรถที่กำลังจะมาถึง"
          icon={<PlaceRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1}>
            {UPCOMING_PICKUPS.map((item, idx) => (
              <Box key={item.id}>
                <Stack direction="row" className="items-start justify-between">
                  <Box className="min-w-0">
                    <Typography className="text-sm font-semibold text-slate-900">
                      {item.id}
                    </Typography>
                    <Typography className="text-sm text-slate-700 truncate">
                      {item.customer} • {item.car}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<AccessTimeRoundedIcon />}
                    label={item.at}
                    size="medium"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
                {idx !== UPCOMING_PICKUPS.length - 1 ? (
                  <Divider sx={{ mt: 1.25 }} />
                ) : null}
              </Box>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="คืนรถวันนี้"
          sub="รายการคืนรถที่ควรติดตาม"
          icon={<ExtensionRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1}>
            {UPCOMING_RETURNS.map((item, idx) => (
              <Box key={item.id}>
                <Stack direction="row" className="items-start justify-between">
                  <Box className="min-w-0">
                    <Typography className="text-sm font-semibold text-slate-900">
                      {item.id}
                    </Typography>
                    <Typography className="text-sm text-slate-700 truncate">
                      {item.customer} • {item.car}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<AccessTimeRoundedIcon />}
                    label={item.at}
                    size="medium"
                    color="success"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
                {idx !== UPCOMING_RETURNS.length - 1 ? (
                  <Divider sx={{ mt: 1.25 }} />
                ) : null}
              </Box>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard
          title="รถยอดนิยม"
          sub="เรียงตามจำนวนการจอง"
          icon={<CheckCircleRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1.25}>
            {TOP_CARS.map((car) => (
              <Box
                key={car.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <Typography className="text-sm font-semibold text-slate-900">
                  {car.name}
                </Typography>

                <Stack direction="row" className="mt-2 items-center justify-between">
                  <Typography className="text-xs text-slate-500">
                    การจอง {car.bookings} ครั้ง
                  </Typography>
                  <Typography className="text-xs font-semibold text-slate-900">
                    {formatTHB(car.revenue)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </Box>

      {/* latest bookings + activity */}
      <Box className="grid gap-4 xl:grid-cols-[1.6fr_.9fr]">
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
                  size="medium"
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
                <Box
                  key={b.id}
                  sx={{
                    transition: "background-color .18s ease",
                    "&:hover": {
                      backgroundColor: "rgb(248 250 252)",
                    },
                  }}
                >
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
                          <UrgencyChip booking={b} />
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
                            size="medium"
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
                            size="medium"
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

        <SectionCard
          title="กิจกรรมล่าสุดในระบบ"
          sub="ติดตามความเคลื่อนไหวล่าสุดของทีมและลูกค้า"
          icon={<ForumRoundedIcon fontSize="medium" />}
        >
          <Stack spacing={1.5}>
            {ACTIVITY_FEED.map((item, idx) => (
              <Box key={item.id}>
                <Typography className="text-sm text-slate-800">{item.text}</Typography>
                <Typography className="mt-1 text-xs text-slate-500">{item.time}</Typography>
                {idx !== ACTIVITY_FEED.length - 1 ? <Divider sx={{ mt: 1.5 }} /> : null}
              </Box>
            ))}
          </Stack>
        </SectionCard>
      </Box>
    </Box>
  );
}