"use client";

import * as React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
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

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
      <CardContent className="p-5!">
        <Stack direction="row" className="items-start justify-between">
          <Box>
            <Typography className="text-sm font-semibold text-slate-500">
              {title}
            </Typography>
            <Typography className="mt-2 text-3xl font-black text-slate-950">
              {value}
            </Typography>
            <Typography className="mt-1 text-xs text-slate-500">
              {detail}
            </Typography>
          </Box>
          <Box className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = React.useState<PartnerDashboard | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

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
  }, []);

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
    <Box className="grid gap-5">
      <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-slate-950 text-white">
        <CardContent className="p-6!">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            className="items-start justify-between"
          >
            <Box>
              <Chip label="Partner Dashboard" className="bg-white/10! text-white!" />
              <Typography className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                {dashboard.tenant.shopName}
              </Typography>
              <Typography className="mt-2 text-sm text-slate-300">
                {dashboard.tenant.publicDomain}
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component={Link}
                href="/admin/cars"
                variant="contained"
                className="rounded-2xl!"
                sx={{ bgcolor: "white", color: "rgb(15 23 42)" }}
              >
                จัดการรถ
              </Button>
              <Button
                component={Link}
                href="/admin/locations"
                variant="outlined"
                className="rounded-2xl! border-white/30! text-white!"
              >
                จัดการสาขา
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="รถทั้งหมด"
          value={dashboard.summary.totalCars}
          detail={`พร้อมให้เช่า ${dashboard.summary.availableCars} คัน`}
          icon={<DirectionsCarRoundedIcon />}
        />
        <StatCard
          title="สาขาทั้งหมด"
          value={dashboard.summary.totalBranches}
          detail={`เปิดใช้งาน ${dashboard.summary.activeBranches} สาขา`}
          icon={<PlaceRoundedIcon />}
        />
        <StatCard
          title="การจองทั้งหมด"
          value={dashboard.summary.totalBookings}
          detail={`รับรถวันนี้ ${dashboard.summary.todayPickups} / คืนรถวันนี้ ${dashboard.summary.todayReturns}`}
          icon={<CalendarMonthRoundedIcon />}
        />
        <StatCard
          title="รายได้ที่ชำระแล้ว"
          value={formatTHB(dashboard.summary.totalRevenue)}
          detail={`รีวิวทั้งหมด ${dashboard.summary.totalReviews} รายการ`}
          icon={<PaymentsRoundedIcon />}
        />
      </Box>

      <Box className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Box>
                <Typography className="text-lg font-black text-slate-950">
                  รายได้ 7 วันล่าสุด
                </Typography>
                <Typography className="text-sm text-slate-500">
                  คำนวณจากรายการจองของร้านนี้เท่านั้น
                </Typography>
              </Box>
              <StorefrontRoundedIcon className="text-slate-400" />
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

        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-5!">
            <Typography className="text-lg font-black text-slate-950">
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
        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white xl:col-span-2">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Typography className="text-lg font-black text-slate-950">
                การจองล่าสุด
              </Typography>
              <CalendarMonthRoundedIcon className="text-slate-400" />
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
                      <Chip label={bookingStatusLabel(booking.status)} variant="outlined" />
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

        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-5!">
            <Stack direction="row" className="items-center justify-between">
              <Typography className="text-lg font-black text-slate-950">
                รถทำรายได้สูงสุด
              </Typography>
              <DirectionsCarRoundedIcon className="text-slate-400" />
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

      <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
        <CardContent className="p-5!">
          <Stack direction="row" className="items-center justify-between">
            <Typography className="text-lg font-black text-slate-950">
              รีวิวล่าสุด
            </Typography>
            <ForumRoundedIcon className="text-slate-400" />
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
