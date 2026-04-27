"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { usePartnerRealtimeRefresh } from "@/src/hooks/realtime/usePartnerRealtimeRefresh";
import { dashboardService } from "@/src/services/dashboard/dashboard.service";
import type { PartnerDashboard } from "@/src/services/dashboard/dashboard.types";

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

function statusChipClass(status?: string) {
  const normalized = (status || "").toLowerCase();
  if (["paid", "completed", "active", "verified", "settled"].includes(normalized)) {
    return "partner-chip partner-chip-green";
  }
  if (["cancelled", "failed", "refunded", "closed"].includes(normalized)) {
    return "partner-chip partner-chip-rose";
  }
  if (["pending", "waiting", "draft", "new"].includes(normalized)) {
    return "partner-chip partner-chip-orange";
  }
  if (["confirmed", "open"].includes(normalized)) {
    return "partner-chip partner-chip-blue";
  }
  return "partner-chip";
}

function StatCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card elevation={0} className="partner-card rounded-[30px]!">
      <CardContent className="p-5!">
        <Typography className="text-sm font-semibold text-slate-500">
          {title}
        </Typography>
        <Typography className="partner-stat-value mt-3 text-slate-950">
          {value}
        </Typography>
        <Typography className="mt-2 text-sm leading-6 text-slate-500">
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboardPage() {
  const [dashboard, setDashboard] = React.useState<PartnerDashboard | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [reloadTick, setReloadTick] = React.useState(0);

  const refreshFromRealtime = React.useCallback(() => {
    setReloadTick((current) => current + 1);
  }, []);

  usePartnerRealtimeRefresh({
    events: [
      "booking.created",
      "booking.updated",
      "booking.cancelled",
      "payment.created",
      "payment.updated",
      "car.changed",
      "availability.changed",
      "support.changed",
    ],
    onRefresh: refreshFromRealtime,
  });

  React.useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await dashboardService.getDashboard();
        if (active) setDashboard(data);
      } catch (err: unknown) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [reloadTick]);

  if (loading) {
    return (
      <Box className="grid min-h-[60vh] place-items-center">
        <Stack spacing={2} className="items-center">
          <CircularProgress />
          <Typography className="text-sm text-slate-500">
            กำลังโหลดข้อมูลร้าน...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !dashboard) {
    return <Alert severity="error">{error || "ไม่พบข้อมูลแดชบอร์ด"}</Alert>;
  }

  const maxWeeklyRevenue = Math.max(
    ...dashboard.weeklySales.map((row) => row.revenue),
    1
  );
  const bookingStatusTotal = Object.values(dashboard.bookingStatus).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <Box className="partner-page">
      <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="รถทั้งหมด"
          value={dashboard.summary.totalCars}
          detail={`พร้อมให้เช่า ${dashboard.summary.availableCars} คัน`}
        />
        <StatCard
          title="สาขาทั้งหมด"
          value={dashboard.summary.totalBranches}
          detail={`เปิดใช้งาน ${dashboard.summary.activeBranches} สาขา`}
        />
        <StatCard
          title="การจองทั้งหมด"
          value={dashboard.summary.totalBookings}
          detail={`รับรถวันนี้ ${dashboard.summary.todayPickups} / คืนรถวันนี้ ${dashboard.summary.todayReturns}`}
        />
        <StatCard
          title="รายได้ที่ชำระแล้ว"
          value={formatTHB(dashboard.summary.totalRevenue)}
          detail={`รีวิวทั้งหมด ${dashboard.summary.totalReviews} รายการ`}
        />
      </Box>

      <Box className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Box>
                <Typography className="partner-section-title text-slate-950">
                  รายได้ 7 วันล่าสุด
                </Typography>
              </Box>
              <Box className="partner-page-kicker">รายได้</Box>
            </Stack>
            <Stack spacing={2.25} className="mt-5">
              {dashboard.weeklySales.map((row) => (
                <Box key={row.key}>
                  <Stack direction="row" className="mb-1 items-center justify-between">
                    <Typography className="text-sm font-semibold text-slate-600">
                      {row.day}
                    </Typography>
                    <Typography className="text-sm font-bold text-slate-950">
                      {formatTHB(row.revenue)} • {row.bookings} จอง
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(row.revenue / maxWeeklyRevenue) * 100}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: "rgb(241 245 249)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        bgcolor: "rgb(15 23 42)",
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-5!">
            <Typography className="partner-section-title text-slate-950">
              สถานะการจอง
            </Typography>
            <Stack spacing={2} className="mt-5">
              {Object.entries(dashboard.bookingStatus).map(([status, count]) => (
                <Box key={status}>
                  <Stack direction="row" className="mb-1 items-center justify-between">
                    <Typography className="text-sm font-semibold text-slate-600">
                      {bookingStatusLabel(status)}
                    </Typography>
                    <Typography className="text-sm font-bold text-slate-950">
                      {count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={bookingStatusTotal ? (count / bookingStatusTotal) * 100 : 0}
                    sx={{
                      height: 9,
                      borderRadius: 999,
                      bgcolor: "rgb(241 245 249)",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box className="grid gap-5 xl:grid-cols-3">
        <Card elevation={0} className="partner-card rounded-[30px]! xl:col-span-2">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Typography className="partner-section-title text-slate-950">
                การจองล่าสุด
              </Typography>
              <Box className="partner-page-kicker">ล่าสุด</Box>
            </Stack>
            <Stack divider={<Divider />} className="mt-3">
              {dashboard.recentBookings.length ? (
                dashboard.recentBookings.map((booking) => (
                  <Stack
                    key={booking.id}
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    className="justify-between py-3"
                  >
                    <Box>
                      <Typography className="font-bold text-slate-950">
                        {booking.bookingCode} • {booking.customerName}
                      </Typography>
                      <Typography className="text-sm text-slate-500">
                        {booking.carName || booking.carId}
                      </Typography>
                      <Typography className="text-xs text-slate-400">
                        {formatDate(booking.createdAt)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} className="items-center">
                      <Chip
                        label={bookingStatusLabel(booking.status)}
                        className={statusChipClass(booking.status)}
                      />
                      <Typography className="font-black text-slate-950">
                        {formatTHB(booking.totalAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography className="py-8 text-center text-sm text-slate-500">
                  ยังไม่มีการจอง
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Typography className="partner-section-title text-slate-950">
                รถทำรายได้สูงสุด
              </Typography>
              <Box className="partner-page-kicker">รายได้สูงสุด</Box>
            </Stack>
            <Stack spacing={2} className="mt-5">
              {dashboard.topCars.length ? (
                dashboard.topCars.map((car) => (
                  <Box key={car.id}>
                    <Typography className="font-bold text-slate-950">
                      {car.name}
                    </Typography>
                    <Typography className="text-sm text-slate-500">
                      {car.bookings} จอง • {formatTHB(car.revenue)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography className="py-8 text-center text-sm text-slate-500">
                  ยังไม่มีข้อมูลรายได้รถ
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card elevation={0} className="partner-card rounded-[30px]!">
        <CardContent className="p-5!">
          <Stack direction="row" className="items-center justify-between">
            <Typography className="partner-section-title text-slate-950">
              รีวิวล่าสุด
            </Typography>
            <Box className="partner-page-kicker">รีวิว</Box>
          </Stack>
          <Stack divider={<Divider />} className="mt-3">
            {dashboard.recentReviews.length ? (
              dashboard.recentReviews.map((review) => (
                <Box key={review.id} className="py-3">
                  <Typography className="font-bold text-slate-950">
                    {review.firstName} {review.lastName} • {review.rating}/5
                  </Typography>
                  <Typography className="mt-1 text-sm text-slate-600">
                    {review.comment || "ไม่มีข้อความรีวิว"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography className="py-8 text-center text-sm text-slate-500">
                ยังไม่มีรีวิว
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
