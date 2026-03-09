"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Button,
  Drawer,
  Snackbar,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type DrawerMode = "detail" | "status" | "cancel" | null;

type BookingRow = {
  id: string;
  carName: string;
  carImage?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  customerName: string;
  phone: string;
  totalPrice: number;
  status: BookingStatus;
  adminNote?: string;
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
};

const SEED: BookingRow[] = [
  {
    id: "RNT-BK-202603-0001",
    carName: "BMW 320d M Sport",
    carImage: "/cosySec1.webp",
    pickupDate: "2026-03-01",
    returnDate: "2026-03-03",
    pickupLocation: "สนามบินสุวรรณภูมิ",
    returnLocation: "สนามบินสุวรรณภูมิ",
    customerName: "Pachara",
    phone: "09x-xxx-xxxx",
    totalPrice: 1290 * 2,
    status: "confirmed",
    adminNote: "ลูกค้ายืนยันรับรถตามเวลา 09:00 น.",
    customerNote: "การจองของคุณได้รับการยืนยันแล้ว",
    createdAt: "2026-02-25 14:20",
    updatedAt: "2026-02-26 10:45",
  },
  {
    id: "RNT-BK-202603-0002",
    carName: "BMW 330e M Sport",
    carImage: "/cosySec2.webp",
    pickupDate: "2026-03-02",
    returnDate: "2026-03-04",
    pickupLocation: "เซ็นทรัลลาดพร้าว",
    returnLocation: "เซ็นทรัลลาดพร้าว",
    customerName: "Pachara",
    phone: "09x-xxx-xxxx",
    totalPrice: 1490 * 2,
    status: "pending",
    adminNote: "",
    customerNote: "",
    createdAt: "2026-02-26 09:15",
    updatedAt: "2026-02-26 09:15",
  },
  {
    id: "RNT-BK-202603-0003",
    carName: "BMW M3 CS",
    carImage: "/cosySec3.webp",
    pickupDate: "2026-03-03",
    returnDate: "2026-03-05",
    pickupLocation: "สถานีขนส่งหมอชิต",
    returnLocation: "สถานีขนส่งหมอชิต",
    customerName: "Pachara",
    phone: "09x-xxx-xxxx",
    totalPrice: 1990 * 2,
    status: "confirmed",
    adminNote: "ลูกค้าขอเตรียมรถล่วงหน้า 30 นาที",
    customerNote: "โปรดมาถึงก่อนเวลานัด 10 นาที",
    createdAt: "2026-02-26 16:00",
    updatedAt: "2026-02-27 08:30",
  },
  {
    id: "RNT-BK-202603-0004",
    carName: "BMW i5 eDrive40 M Sport",
    carImage: "/cosySec4.webp",
    pickupDate: "2026-03-04",
    returnDate: "2026-03-06",
    pickupLocation: "เซ็นทรัลเวิลด์",
    returnLocation: "เซ็นทรัลเวิลด์",
    customerName: "Pachara",
    phone: "09x-xxx-xxxx",
    totalPrice: 1590 * 2,
    status: "pending",
    adminNote: "",
    customerNote: "",
    createdAt: "2026-02-27 11:10",
    updatedAt: "2026-02-27 11:10",
  },
];

function formatTHB(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  const num = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${num} บาท`;
}

function getNowString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function makeNextBookingId(rows: BookingRow[]) {
  const nums = rows
    .map((r) => {
      const parts = r.id.split("-");
      return Number(parts[parts.length - 1]);
    })
    .filter((n) => Number.isFinite(n));

  const next = nums.length ? Math.max(...nums) + 1 : 1;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");

  return `BK-${y}${m}-${String(next).padStart(4, "0")}`;
}

function getStatusMeta(status: BookingStatus) {
  const map: Record<
    BookingStatus,
    {
      label: string;
      color: "default" | "success" | "warning" | "error";
      tone: "amber" | "emerald" | "rose" | "slate";
    }
  > = {
    pending: { label: "รอดำเนินการ", color: "warning", tone: "amber" },
    confirmed: { label: "ยืนยันแล้ว", color: "success", tone: "emerald" },
    cancelled: { label: "ยกเลิก", color: "error", tone: "rose" },
    completed: { label: "เสร็จสิ้น", color: "default", tone: "slate" },
  };

  return map[status];
}

function statusChipSX(tone: ReturnType<typeof getStatusMeta>["tone"]) {
  if (tone === "amber") {
    return {
      border: "1px solid rgb(253 230 138)",
      bgcolor: "rgb(254 243 199)",
      color: "rgb(146 64 14)",
    };
  }
  if (tone === "emerald") {
    return {
      border: "1px solid rgb(167 243 208)",
      bgcolor: "rgb(209 250 229)",
      color: "rgb(6 95 70)",
    };
  }
  if (tone === "rose") {
    return {
      border: "1px solid rgb(254 202 202)",
      bgcolor: "rgb(254 226 226)",
      color: "rgb(153 27 27)",
    };
  }
  return {
    border: "1px solid rgb(226 232 240)",
    bgcolor: "rgb(248 250 252)",
    color: "rgb(51 65 85)",
  };
}

function StatusChip({ s }: { s: BookingStatus }) {
  const m = getStatusMeta(s);

  return (
    <Chip
      size="medium"
      label={m.label}
      variant="outlined"
      sx={statusChipSX(m.tone)}
    />
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr]">
      <Typography className="text-sm font-medium text-slate-500">
        {label}
      </Typography>
      <Box className="text-sm font-semibold text-slate-900">{value}</Box>
    </Box>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="rounded-2xl border border-slate-200 bg-white p-4">
      <Typography className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </Typography>
      <Divider className="my-2! border-slate-200!" />
      <Stack spacing={0.5}>{children}</Stack>
    </Box>
  );
}

function CarThumb({
  src,
  alt,
  width = 80,
  height = 56,
  rounded = 12,
}: {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  rounded?: number;
}) {
  return (
    <Box
      className="overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
      sx={{
        width,
        height,
        borderRadius: `${rounded}px`,
      }}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <Box className="grid h-full w-full place-items-center text-slate-400">
          <DirectionsCarRoundedIcon fontSize="medium" />
        </Box>
      )}
    </Box>
  );
}

export default function AdminBookingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [rowsData, setRowsData] = React.useState<BookingRow[]>(SEED);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<BookingStatus | "all">("all");

  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedBookingId, setSelectedBookingId] = React.useState<
    string | null
  >(null);

  const [nextStatus, setNextStatus] = React.useState<BookingStatus>("pending");
  const [adminNote, setAdminNote] = React.useState("");
  const [customerNote, setCustomerNote] = React.useState("");

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const selectedBooking = React.useMemo(
    () => rowsData.find((item) => item.id === selectedBookingId) ?? null,
    [rowsData, selectedBookingId]
  );

  const rows = React.useMemo(() => {
    return rowsData.filter((r) => {
      const keyword = q.toLowerCase();
      const okQ =
        !q ||
        r.id.toLowerCase().includes(keyword) ||
        r.carName.toLowerCase().includes(keyword) ||
        r.customerName.toLowerCase().includes(keyword);
      const okS = status === "all" ? true : r.status === status;
      return okQ && okS;
    });
  }, [q, status, rowsData]);

  const openDetailDrawer = (booking: BookingRow) => {
    setSelectedBookingId(booking.id);
    setDrawerMode("detail");
  };

  const openStatusDrawer = (booking: BookingRow) => {
    setSelectedBookingId(booking.id);
    setNextStatus(booking.status);
    setAdminNote(booking.adminNote ?? "");
    setCustomerNote(booking.customerNote ?? "");
    setDrawerMode("status");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
  };

  const handleDrawerExited = () => {
    setSelectedBookingId(null);
    setNextStatus("pending");
    setAdminNote("");
    setCustomerNote("");
  };

  const applyStatusUpdate = (
    newStatus: BookingStatus,
    customAdminNote?: string,
    customCustomerNote?: string
  ) => {
    if (!selectedBooking) return;

    const now = getNowString();
    const nextAdminNote =
      customAdminNote !== undefined ? customAdminNote : adminNote;
    const nextCustomerNote =
      customCustomerNote !== undefined ? customCustomerNote : customerNote;

    setRowsData((prev) =>
      prev.map((item) =>
        item.id === selectedBooking.id
          ? {
              ...item,
              status: newStatus,
              adminNote: nextAdminNote,
              customerNote: nextCustomerNote,
              updatedAt: now,
            }
          : item
      )
    );

    setSnack({
      open: true,
      msg: `อัปเดตสถานะเป็น "${getStatusMeta(newStatus).label}" สำเร็จ`,
      type: "success",
    });
    setDrawerMode(null);
  };

  const quickActions: Array<{
    label: string;
    status: BookingStatus;
    variant: "contained" | "outlined";
    sx: object;
    icon: React.ReactNode;
    confirmBefore?: boolean;
  }> = [
    {
      label: "ยืนยัน",
      status: "confirmed",
      variant: "contained",
      icon: <CheckCircleRoundedIcon />,
      sx: {
        textTransform: "none",
        bgcolor: "rgb(22 163 74)",
        boxShadow: "none",
        "&:hover": { bgcolor: "rgb(21 128 61)", boxShadow: "none" },
      },
    },
    {
      label: "ยกเลิก",
      status: "cancelled",
      variant: "outlined",
      icon: <CancelRoundedIcon />,
      confirmBefore: true,
      sx: {
        textTransform: "none",
        borderColor: "rgb(239 68 68)",
        color: "rgb(220 38 38)",
        "&:hover": {
          borderColor: "rgb(220 38 38)",
          bgcolor: "rgb(254 242 242)",
        },
      },
    },
    {
      label: "เสร็จสิ้น",
      status: "completed",
      variant: "outlined",
      icon: <TaskAltRoundedIcon />,
      sx: {
        textTransform: "none",
        borderColor: "rgb(100 116 139)",
        color: "rgb(15 23 42)",
        "&:hover": {
          borderColor: "rgb(71 85 105)",
          bgcolor: "rgb(248 250 252)",
        },
      },
    },
  ];

  return (
    <>
      <Box className="grid gap-4">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          className="items-start md:items-center justify-between"
        >
          <Box>
            <Typography
              variant="h6"
              className="text-xl font-extrabold text-slate-900"
            >
              การจอง
            </Typography>
            <Typography className="text-sm text-slate-600">
              ค้นหา / กรอง และจัดการสถานะการจอง
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            className="w-full md:w-auto"
          >
            <TextField
              size="small"
              label="ค้นหา (รหัส/รถ/ลูกค้า)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full sm:w-70"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            />
            <TextField
              size="small"
              select
              label="สถานะ"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as BookingStatus | "all")
              }
              className="w-full sm:w-45"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="pending">รอดำเนินการ</MenuItem>
              <MenuItem value="confirmed">ยืนยันแล้ว</MenuItem>
              <MenuItem value="cancelled">ยกเลิก</MenuItem>
              <MenuItem value="completed">เสร็จสิ้น</MenuItem>
            </TextField>
          </Stack>
        </Stack>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-0">
            <Box className="grid">
              {rows.map((b, idx) => (
                <Box key={b.id}>
                  <Box className="p-4 sm:p-5">
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      className="items-start justify-between"
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        className="min-w-0 flex-1 w-full"
                      >
                        <Box
                          className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                          sx={{
                            width: {
                              xs: "100%",
                              md: 220,
                              lg: 260,
                            },
                            height: {
                              xs: 180,
                              sm: 220,
                              md: 150,
                              lg: 170,
                            },
                          }}
                        >
                          {b.carImage ? (
                            <Box
                              component="img"
                              src={b.carImage}
                              alt={b.carName}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          ) : (
                            <Box className="grid h-full w-full place-items-center text-slate-400">
                              <DirectionsCarRoundedIcon sx={{ fontSize: 42 }} />
                            </Box>
                          )}
                        </Box>

                        <Box className="min-w-0 flex-1">
                          <Stack
                            direction="row"
                            spacing={1.5}
                            className="items-center flex-wrap"
                          >
                            <Typography className="text-sm font-extrabold text-slate-900 tracking-wide">
                              {b.id}
                            </Typography>

                            <StatusChip s={b.status} />
                          </Stack>

                          <Typography className="mt-1 text-lg font-bold text-slate-800">
                            {b.carName}
                          </Typography>

                          <Divider className="my-2! border-slate-200!" />

                          <Typography className="text-xs text-slate-500">
                            รับรถ:{" "}
                            <span className="font-medium text-slate-700">
                              {b.pickupDate}
                            </span>
                            {" • "}
                            คืนรถ:{" "}
                            <span className="font-medium text-slate-700">
                              {b.returnDate}
                            </span>
                          </Typography>

                          <Typography className="mt-1 text-xs text-slate-500">
                            จุดรับ:{" "}
                            <span className="font-medium text-slate-700">
                              {b.pickupLocation}
                            </span>
                            {" • "}
                            จุดคืน:{" "}
                            <span className="font-medium text-slate-700">
                              {b.returnLocation}
                            </span>
                          </Typography>

                          <Typography className="mt-1 text-xs text-slate-500">
                            ลูกค้า:{" "}
                            <span className="font-medium text-slate-700">
                              {b.customerName}
                            </span>
                            {" • "}
                            {b.phone}
                          </Typography>

                          <Typography className="mt-2 text-xs text-slate-400">
                            สร้างเมื่อ {b.createdAt} • อัปเดตล่าสุด{" "}
                            {b.updatedAt}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        spacing={1.5}
                        className="w-full md:w-auto"
                        sx={{
                          minWidth: { md: 180, lg: 200 },
                        }}
                      >
                        <Box className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <Typography className="text-xs text-slate-500">
                            ยอดรวม
                          </Typography>
                          <Typography className="text-sm font-semibold text-slate-900">
                            {formatTHB(b.totalPrice)}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          className="justify-end"
                        >
                          <Button
                            size="medium"
                            variant="outlined"
                            onClick={() => openDetailDrawer(b)}
                            className="rounded-lg!"
                            sx={{
                              textTransform: "none",
                              borderColor: "rgb(226 232 240)",
                            }}
                          >
                            รายละเอียด
                          </Button>

                          <Button
                            size="medium"
                            variant="contained"
                            onClick={() => openStatusDrawer(b)}
                            className="rounded-lg!"
                            sx={{
                              textTransform: "none",
                              bgcolor: "rgb(15 23 42)",
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "rgb(2 6 23)",
                                boxShadow: "none",
                              },
                            }}
                          >
                            เปลี่ยนสถานะ
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>

                  {idx !== rows.length - 1 ? (
                    <Divider className="border-slate-200!" />
                  ) : null}
                </Box>
              ))}

              {!rows.length ? (
                <Box className="p-8 text-center">
                  <Typography className="text-sm text-slate-600">
                    ไม่พบรายการที่ตรงกับเงื่อนไข
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={drawerMode !== null}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: true,
          onTransitionExited: handleDrawerExited,
        }}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 700,
            height: isMobile ? "88%" : "100%",
            borderTopLeftRadius: isMobile ? 18 : 0,
            borderTopRightRadius: isMobile ? 18 : 0,
            overflow: "hidden",
            bgcolor: "rgb(248 250 252)",
          },
        }}
      >
        <Box className="flex h-full flex-col">
          {/* Topbar */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              borderBottom: "1px solid rgb(226 232 240)",
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isMobile ? (
              <Box className="flex justify-center pt-2">
                <Box className="h-1.5 w-12 rounded-full bg-slate-300" />
              </Box>
            ) : null}

            <Box className="px-4 py-3">
              <Stack
                direction="row"
                spacing={1.5}
                className="items-center justify-between"
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  className="items-center min-w-0"
                >
                  <Box
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200"
                    sx={{
                      bgcolor:
                        drawerMode === "detail"
                          ? "rgb(241 245 249)"
                          : drawerMode === "status"
                          ? "rgb(254 249 195)"
                          : "rgb(254 242 242)",
                      color:
                        drawerMode === "detail"
                          ? "rgb(15 23 42)"
                          : drawerMode === "status"
                          ? "rgb(146 64 14)"
                          : "rgb(185 28 28)",
                    }}
                  >
                    {drawerMode === "detail" ? (
                      <DirectionsCarRoundedIcon sx={{ fontSize: 20 }} />
                    ) : drawerMode === "status" ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    )}
                  </Box>

                  <Box className="min-w-0">
                    <Typography className="truncate text-sm font-black text-slate-900">
                      {drawerMode === "detail"
                        ? "รายละเอียดการจอง"
                        : drawerMode === "status"
                        ? "เปลี่ยนสถานะการจอง"
                        : "ยืนยันการยกเลิก"}
                    </Typography>

                    <Typography className="truncate text-xs text-slate-500">
                      {selectedBooking
                        ? `${selectedBooking.id} • ${selectedBooking.carName}`
                        : "-"}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton
                  onClick={closeDrawer}
                  sx={{
                    border: "1px solid rgb(226 232 240)",
                    bgcolor: "white",
                    "&:hover": {
                      bgcolor: "rgb(248 250 252)",
                    },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>

          {/* Content */}
          <Box className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {drawerMode === "detail" && selectedBooking ? (
              <Stack spacing={2}>
                <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <Box
                    className="relative bg-linear-to-br from-slate-900 to-slate-700"
                    sx={{ minHeight: 220 }}
                  >
                    {selectedBooking.carImage ? (
                      <Box
                        component="img"
                        src={selectedBooking.carImage}
                        alt={selectedBooking.carName}
                        sx={{
                          width: "100%",
                          height: 220,
                          objectFit: "cover",
                          display: "block",
                          opacity: 0.5,
                        }}
                      />
                    ) : (
                      <Box className="grid h-55 w-full place-items-center text-slate-300">
                        <DirectionsCarRoundedIcon sx={{ fontSize: 56 }} />
                      </Box>
                    )}

                    <Box
                      className="absolute inset-0"
                      sx={{
                        background:
                          "linear-gradient(to bottom, rgba(15,23,42,0.82), rgba(15,23,42,0.18))",
                      }}
                    />

                    <Box className="absolute inset-x-0 top-0 p-4 text-white">
                      <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Booking Overview
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        className="mt-2 items-center flex-wrap"
                      >
                        <Typography className="text-xl font-extrabold">
                          {selectedBooking.carName}
                        </Typography>
                      </Stack>
                      <Typography className="mt-2 text-sm text-slate-200">
                        {selectedBooking.pickupDate} ถึง{" "}
                        {selectedBooking.returnDate}
                      </Typography>
                      <Typography className="mt-4 text-sm text-slate-300">
                        ยอดรวม
                      </Typography>
                      <Typography className="text-2xl font-extrabold">
                        {formatTHB(selectedBooking.totalPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="ข้อมูลรถ">
                    <InfoRow label="รหัสการจอง" value={selectedBooking.id} />
                    <InfoRow label="รุ่นรถ" value={selectedBooking.carName} />
                    <InfoRow
                      label="ยอดรวม"
                      value={formatTHB(selectedBooking.totalPrice)}
                    />
                    <InfoRow
                      label="สถานะ"
                      value={<StatusChip s={selectedBooking.status} />}
                    />
                  </SectionCard>

                  <SectionCard title="ข้อมูลลูกค้า">
                    <InfoRow
                      label="ชื่อผู้จอง"
                      value={selectedBooking.customerName}
                    />
                    <InfoRow label="เบอร์โทร" value={selectedBooking.phone} />
                  </SectionCard>

                  <SectionCard title="ข้อมูลการรับรถ">
                    <InfoRow
                      label="วันรับรถ"
                      value={selectedBooking.pickupDate}
                    />
                    <InfoRow
                      label="จุดรับรถ"
                      value={selectedBooking.pickupLocation}
                    />
                  </SectionCard>

                  <SectionCard title="ข้อมูลการคืนรถ">
                    <InfoRow
                      label="วันคืนรถ"
                      value={selectedBooking.returnDate}
                    />
                    <InfoRow
                      label="จุดคืนรถ"
                      value={selectedBooking.returnLocation}
                    />
                  </SectionCard>

                  <SectionCard title="ข้อมูลระบบ">
                    <InfoRow
                      label="วันที่สร้าง"
                      value={selectedBooking.createdAt}
                    />
                    <InfoRow
                      label="อัปเดตล่าสุด"
                      value={selectedBooking.updatedAt}
                    />
                  </SectionCard>

                  <SectionCard title="หมายเหตุภายในแอดมิน">
                    <Typography className="text-sm leading-6 text-slate-700">
                      {selectedBooking.adminNote?.trim()
                        ? selectedBooking.adminNote
                        : "ยังไม่มีหมายเหตุภายใน"}
                    </Typography>
                  </SectionCard>

                  <SectionCard title="หมายเหตุที่ลูกค้าเห็น">
                    <Typography className="text-sm leading-6 text-slate-700">
                      {selectedBooking.customerNote?.trim()
                        ? selectedBooking.customerNote
                        : "ยังไม่มีหมายเหตุสำหรับลูกค้า"}
                    </Typography>
                  </SectionCard>
                </Box>

                <Stack direction="row" spacing={1} className="pt-0.5">
                  <Button
                    fullWidth
                    size="medium"
                    variant="outlined"
                    onClick={closeDrawer}
                    sx={{
                      textTransform: "none",
                      borderColor: "rgb(226 232 240)",
                      color: "rgb(15 23 42)",
                      borderRadius: 2.5,
                    }}
                  >
                    ปิดหน้าต่าง
                  </Button>
                  <Button
                    fullWidth
                    size="medium"
                    variant="contained"
                    onClick={() => setDrawerMode("status")}
                    sx={{
                      textTransform: "none",
                      bgcolor: "rgb(15 23 42)",
                      boxShadow: "none",
                      borderRadius: 2.5,
                      "&:hover": {
                        bgcolor: "rgb(2 6 23)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    เปลี่ยนสถานะ
                  </Button>
                </Stack>
              </Stack>
            ) : null}

            {drawerMode === "status" && selectedBooking ? (
              <Stack spacing={2}>
                <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Typography className="text-sm font-bold text-slate-900">
                      สถานะปัจจุบัน
                    </Typography>
                    <StatusChip s={selectedBooking.status} />
                  </Stack>
                </Box>

                <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    className="items-start sm:items-center justify-between"
                  >
                    <Typography className="text-sm font-bold text-slate-900">
                      เลือกสถานะใหม่
                    </Typography>

                    <Stack direction="row" spacing={1} className="items-center">
                      <Typography className="text-xs text-slate-500">
                        จะบันทึกเป็น
                      </Typography>
                      <StatusChip s={nextStatus} />
                    </Stack>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    className="mt-4"
                  >
                    {quickActions.map((action) => {
                      const isActive = nextStatus === action.status;

                      return (
                        <Button
                          key={action.status}
                          variant={isActive ? "contained" : action.variant}
                          startIcon={action.icon}
                          onClick={() => setNextStatus(action.status)}
                          sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: 2.5,
                            ...(isActive
                              ? {
                                  bgcolor: "rgb(15 23 42)",
                                  color: "white",
                                  boxShadow: "none",
                                  "&:hover": {
                                    bgcolor: "rgb(2 6 23)",
                                    boxShadow: "none",
                                  },
                                }
                              : action.sx),
                          }}
                        >
                          {action.label}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>

                <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Stack spacing={2}>
                    <TextField
                      multiline
                      minRows={4}
                      fullWidth
                      label="หมายเหตุภายในแอดมิน"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="เช่น ติดต่อแล้ว / รอเอกสาร / ลูกค้าขอเลื่อนเวลา"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />

                    <TextField
                      multiline
                      minRows={3}
                      fullWidth
                      label="หมายเหตุที่ลูกค้าเห็น"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="เช่น การจองของคุณได้รับการยืนยันแล้ว / กรุณามาถึงก่อนเวลานัด"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />

                    <Box className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <Stack spacing={1}>
                        <Typography className="text-xs font-medium text-slate-500">
                          ข้อมูลที่จะถูกอัปเดต
                        </Typography>
                        <InfoRow
                          label="สร้างเมื่อ"
                          value={selectedBooking.createdAt}
                        />
                        <InfoRow
                          label="อัปเดตล่าสุด"
                          value={selectedBooking.updatedAt}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} className="pt-0.5">
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={closeDrawer}
                    sx={{
                      textTransform: "none",
                      borderColor: "rgb(226 232 240)",
                      color: "rgb(15 23 42)",
                      borderRadius: 2.5,
                    }}
                  >
                    ยกเลิก
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      if (nextStatus === "cancelled") {
                        setDrawerMode("cancel");
                        return;
                      }
                      applyStatusUpdate(nextStatus);
                    }}
                    sx={{
                      textTransform: "none",
                      bgcolor: "rgb(15 23 42)",
                      boxShadow: "none",
                      borderRadius: 2.5,
                      "&:hover": {
                        bgcolor: "rgb(2 6 23)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    บันทึกสถานะ
                  </Button>
                </Stack>
              </Stack>
            ) : null}

            {drawerMode === "cancel" && selectedBooking ? (
              <Stack spacing={2}>
                <Box className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <Stack direction="row" spacing={1.25} className="items-start">
                    <CarThumb
                      src={selectedBooking.carImage}
                      alt={selectedBooking.carName}
                      width={72}
                      height={52}
                      rounded={12}
                    />
                    <Box>
                      <Typography className="text-sm font-bold text-slate-900">
                        {selectedBooking.id}
                      </Typography>
                      <Typography className="mt-1 text-sm text-slate-700">
                        {selectedBooking.carName}
                      </Typography>
                      <Typography className="mt-1 text-xs text-slate-500">
                        ผู้จอง: {selectedBooking.customerName}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography className="text-sm text-slate-700">
                    คุณต้องการยกเลิก booking นี้ใช่หรือไม่
                  </Typography>
                  <Typography className="mt-2 text-xs text-red-600">
                    หลังยืนยันแล้ว สถานะจะถูกเปลี่ยนเป็น “ยกเลิก”
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    fullWidth
                    size="medium"
                    variant="outlined"
                    onClick={() => setDrawerMode("status")}
                    sx={{
                      textTransform: "none",
                      borderColor: "rgb(226 232 240)",
                      color: "rgb(15 23 42)",
                      borderRadius: 2.5,
                    }}
                  >
                    กลับไปแก้ไข
                  </Button>

                  <Button
                    fullWidth
                    size="medium"
                    variant="contained"
                    onClick={() => applyStatusUpdate("cancelled")}
                    sx={{
                      textTransform: "none",
                      bgcolor: "rgb(220 38 38)",
                      boxShadow: "none",
                      borderRadius: 2.5,
                      "&:hover": {
                        bgcolor: "rgb(185 28 28)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    ยืนยันการยกเลิก
                  </Button>
                </Stack>
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: 24 }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
