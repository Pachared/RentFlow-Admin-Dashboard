"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Divider,
  Chip,
  Button,
  Drawer,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

type DrawerMode = "detail" | "history" | null;
type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  lastBookingId?: string;
};

type BookingHistoryRow = {
  id: string;
  customerId: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: BookingStatus;
};

const SEED: CustomerRow[] = [
  {
    id: "u1",
    name: "Pachara",
    phone: "09x-xxx-xxxx",
    email: "pachara@email.com",
    totalBookings: 3,
    lastBookingId: "BK-1003",
  },
  {
    id: "u2",
    name: "Somchai",
    phone: "08x-xxx-xxxx",
    email: "somchai@email.com",
    totalBookings: 1,
    lastBookingId: "BK-1002",
  },
];

const BOOKING_HISTORY: BookingHistoryRow[] = [
  {
    id: "BK-1001",
    customerId: "u1",
    carName: "BMW 320d M Sport",
    pickupDate: "2026-03-01",
    returnDate: "2026-03-03",
    totalPrice: 2580,
    status: "confirmed",
  },
  {
    id: "BK-1003",
    customerId: "u1",
    carName: "BMW M3 CS",
    pickupDate: "2026-03-03",
    returnDate: "2026-03-05",
    totalPrice: 3980,
    status: "completed",
  },
  {
    id: "BK-1005",
    customerId: "u1",
    carName: "BMW i5 eDrive40 M Sport",
    pickupDate: "2026-03-10",
    returnDate: "2026-03-12",
    totalPrice: 3180,
    status: "pending",
  },
  {
    id: "BK-1002",
    customerId: "u2",
    carName: "BMW 330e M Sport",
    pickupDate: "2026-03-02",
    returnDate: "2026-03-04",
    totalPrice: 2980,
    status: "confirmed",
  },
];

function formatTHB(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  const num = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${num} บาท`;
}

function getStatusMeta(status: BookingStatus) {
  const map: Record<
    BookingStatus,
    {
      label: string;
      tone: "amber" | "emerald" | "rose" | "slate";
    }
  > = {
    pending: { label: "รอดำเนินการ", tone: "amber" },
    confirmed: { label: "ยืนยันแล้ว", tone: "emerald" },
    completed: { label: "เสร็จสิ้น", tone: "slate" },
    cancelled: { label: "ยกเลิก", tone: "rose" },
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
  const meta = getStatusMeta(s);
  return <Chip size="small" label={meta.label} sx={statusChipSX(meta.tone)} />;
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
      <Typography className="text-sm font-extrabold text-slate-900">
        {title}
      </Typography>
      <Divider className="my-3 border-slate-200!" />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

export default function AdminCustomersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [q, setQ] = React.useState("");
  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<
    string | null
  >(null);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const rows = React.useMemo(() => {
    return SEED.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.phone.includes(q) ||
        r.email.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  const selectedCustomer = React.useMemo(
    () => SEED.find((r) => r.id === selectedCustomerId) ?? null,
    [selectedCustomerId]
  );

  const selectedHistory = React.useMemo(
    () => BOOKING_HISTORY.filter((b) => b.customerId === selectedCustomerId),
    [selectedCustomerId]
  );

  const openDetailDrawer = (customer: CustomerRow) => {
    setSelectedCustomerId(customer.id);
    setDrawerMode("detail");
  };

  const openHistoryDrawer = (customer: CustomerRow) => {
    setSelectedCustomerId(customer.id);
    setDrawerMode("history");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
  };

  const handleDrawerExited = () => {
    setSelectedCustomerId(null);
  };

  const totalCustomers = SEED.length;
  const activeCustomers = SEED.filter((c) => c.totalBookings > 0).length;

  return (
    <>
      <Box className="grid gap-4">
        <Box>
          <Typography
            variant="h6"
            className="text-xl font-extrabold text-slate-900"
          >
            ลูกค้า
          </Typography>
          <Typography className="text-sm text-slate-600">
            ดูข้อมูลลูกค้าและประวัติการจอง
          </Typography>
        </Box>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-5">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="items-start sm:items-center justify-between"
            >
              <Stack direction="row" spacing={1.25} className="items-center">
                <Box className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
                  <PeopleAltRoundedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    ทั้งหมด {totalCustomers} คน • มีประวัติการจอง{" "}
                    {activeCustomers} คน
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    ค้นหาจากชื่อ เบอร์โทร หรืออีเมล
                  </Typography>
                </Box>
              </Stack>

              <TextField
                size="small"
                label="ค้นหา (ชื่อ/โทร/อีเมล)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full md:w-[320px]"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-0">
            <Box className="px-5 py-4 flex items-center justify-between">
              <Typography className="text-sm font-bold text-slate-900">
                รายชื่อลูกค้า
              </Typography>
              <Typography className="text-xs text-slate-500">
                {rows.length} รายการ
              </Typography>
            </Box>

            <Divider className="border-slate-200!" />

            {rows.map((c, idx) => (
              <Box key={c.id} className="hover:bg-slate-50 transition-colors">
                <Box className="p-4 sm:p-5">
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    className="items-start justify-between"
                    sx={{
                      alignItems: { xs: "flex-start", md: "stretch" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      className="items-start min-w-0 flex-1 w-full"
                    >
                      <Box className="grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-slate-50 shrink-0">
                        <PersonRoundedIcon fontSize="small" />
                      </Box>

                      <Box className="min-w-0 flex-1">
                        <Typography className="text-lg font-bold text-slate-800">
                          {c.name}
                        </Typography>

                        <Divider className="my-2 border-slate-200!" />

                        <Typography className="text-xs text-slate-500">
                          โทร:{" "}
                          <span className="font-medium text-slate-700">
                            {c.phone}
                          </span>
                        </Typography>

                        <Typography className="mt-1 text-xs text-slate-500">
                          อีเมล:{" "}
                          <span className="font-medium text-slate-700">
                            {c.email}
                          </span>
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          className="mt-2 items-center flex-wrap"
                        >
                          <Chip
                            size="small"
                            label={`การจองทั้งหมด: ${c.totalBookings}`}
                            variant="outlined"
                          />
                          {c.lastBookingId ? (
                            <Chip
                              size="small"
                              label={`ล่าสุด: ${c.lastBookingId}`}
                              variant="outlined"
                            />
                          ) : null}
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack
                      spacing={1.5}
                      className="w-full md:w-auto"
                      sx={{
                        minWidth: { md: 220 },
                        alignSelf: { xs: "stretch", md: "stretch" },
                      }}
                    >
                      <Box className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <Typography className="text-xs text-slate-500">
                          ประวัติการจอง
                        </Typography>
                        <Typography className="text-sm font-semibold text-slate-900">
                          {c.totalBookings} รายการ
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        className="justify-end"
                        sx={{ mt: { md: "auto" } }}
                      >
                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={() => openDetailDrawer(c)}
                          sx={{
                            textTransform: "none",
                            borderColor: "rgb(226 232 240)",
                            borderRadius: 2.5,
                          }}
                        >
                          ดูรายละเอียด
                        </Button>

                        <Button
                          size="medium"
                          variant="contained"
                          onClick={() => openHistoryDrawer(c)}
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
                          ประวัติการจอง
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
                  ไม่พบข้อมูลลูกค้า
                </Typography>
              </Box>
            ) : null}
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
            height: isMobile ? "80%" : "100%",
          },
        }}
      >
        <Box className="p-4">
          <Stack
            direction="row"
            spacing={1.25}
            className="items-center justify-between"
          >
            <Stack
              direction="row"
              spacing={1.25}
              className="items-center min-w-0"
            >
              <Box className="min-w-0">
                <Typography className="text-sm font-black text-slate-900">
                  {drawerMode === "detail" ? "ข้อมูลลูกค้า" : "ประวัติการจอง"}
                </Typography>
                <Typography className="text-xs text-slate-500">
                  {selectedCustomer
                    ? `${selectedCustomer.id} • ${selectedCustomer.name}`
                    : "-"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} className="items-center">
              <IconButton onClick={closeDrawer}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Divider className="my-4! border-slate-200!" />

          {drawerMode === "detail" && selectedCustomer ? (
            <Stack spacing={2}>
              <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Box
                  className="relative bg-linear-to-br from-slate-900 to-slate-700"
                  sx={{ minHeight: 220 }}
                >
                  <Box className="grid h-55 w-full place-items-center text-slate-300">
                    <PersonRoundedIcon sx={{ fontSize: 56 }} />
                  </Box>

                  <Box
                    className="absolute inset-0"
                    sx={{
                      background:
                        "linear-gradient(to bottom, rgba(15,23,42,0.82), rgba(15,23,42,0.18))",
                    }}
                  />

                  <Box className="absolute inset-x-0 top-0 p-4 text-white">
                    <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Customer Overview
                    </Typography>
                    <Typography className="mt-2 text-xl font-extrabold">
                      {selectedCustomer.name}
                    </Typography>
                    <Typography className="mt-2 text-sm text-slate-200">
                      {selectedCustomer.phone}
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-200">
                      {selectedCustomer.email}
                    </Typography>
                    <Typography className="mt-4 text-sm text-slate-300">
                      การจองทั้งหมด
                    </Typography>
                    <Typography className="text-2xl font-extrabold">
                      {selectedCustomer.totalBookings} รายการ
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SectionCard title="ข้อมูลลูกค้า">
                  <InfoRow label="รหัสลูกค้า" value={selectedCustomer.id} />
                  <InfoRow label="ชื่อ" value={selectedCustomer.name} />
                  <InfoRow label="เบอร์โทร" value={selectedCustomer.phone} />
                  <InfoRow label="อีเมล" value={selectedCustomer.email} />
                </SectionCard>

                <SectionCard title="สรุปการใช้งาน">
                  <InfoRow
                    label="จำนวนการจอง"
                    value={`${selectedCustomer.totalBookings} รายการ`}
                  />
                  <InfoRow
                    label="รายการล่าสุด"
                    value={selectedCustomer.lastBookingId ?? "-"}
                  />
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
                  onClick={() => setDrawerMode("history")}
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
                  ดูประวัติการจอง
                </Button>
              </Stack>
            </Stack>
          ) : null}

          {drawerMode === "history" && selectedCustomer ? (
            <Stack spacing={2}>
              <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                <Stack direction="row" spacing={1} className="items-center">
                  <Typography className="text-sm font-bold text-slate-900">
                    ประวัติการจองของ {selectedCustomer.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${selectedHistory.length} รายการ`}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box className="rounded-2xl border border-slate-200 bg-white">
                {selectedHistory.length ? (
                  selectedHistory.map((b, idx) => (
                    <Box key={b.id}>
                      <Box className="p-4">
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                          className="items-start md:items-center justify-between"
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              className="items-center flex-wrap"
                            >
                              <Typography className="text-sm font-bold text-slate-900">
                                {b.id}
                              </Typography>
                              <StatusChip s={b.status} />
                            </Stack>

                            <Typography className="mt-1 text-sm font-semibold text-slate-800">
                              {b.carName}
                            </Typography>

                            <Typography className="mt-2 text-xs text-slate-500">
                              รับรถ: {b.pickupDate} • คืนรถ: {b.returnDate}
                            </Typography>
                          </Box>

                          <Box className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <Typography className="text-xs text-slate-500">
                              ยอดรวม
                            </Typography>
                            <Typography className="text-sm font-semibold text-slate-900">
                              {formatTHB(b.totalPrice)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {idx !== selectedHistory.length - 1 ? (
                        <Divider className="border-slate-200!" />
                      ) : null}
                    </Box>
                  ))
                ) : (
                  <Box className="p-8 text-center">
                    <Typography className="text-sm text-slate-600">
                      ยังไม่มีประวัติการจอง
                    </Typography>
                  </Box>
                )}
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
                  ปิดหน้าต่าง
                </Button>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() =>
                    setSnack({
                      open: true,
                      msg: "พร้อมเชื่อมไปหน้ารายละเอียด booking แล้ว",
                      type: "info",
                    })
                  }
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
                  เปิดหน้ารายการจอง
                </Button>
              </Stack>
            </Stack>
          ) : null}
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
