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
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import CarRentalRoundedIcon from "@mui/icons-material/CarRentalRounded";

type CarStatus = "available" | "rented" | "maintenance" | "hidden";
type DrawerMode = "create" | "detail" | "status" | null;

type CarType = "Economy" | "Sedan" | "SUV" | "Van";
type Transmission = "Auto" | "Manual";
type Fuel = "Gasoline" | "Hybrid" | "EV";

type CarRow = {
  id: string;
  name: string;
  carImage?: string;
  type: CarType;
  seats: number;
  transmission: Transmission;
  fuel: Fuel;
  pricePerDay: number;
  badge?: string;
  status: CarStatus;
  createdAt?: string;
  updatedAt?: string;
};

const SEED: CarRow[] = [
  {
    id: "RNT-CAR-BMW-320D-001",
    name: "BMW 320d M Sport",
    carImage: "/cosySec1.webp",
    type: "Sedan",
    seats: 5,
    transmission: "Auto",
    fuel: "Gasoline",
    pricePerDay: 1290,
    badge: "Best value",
    status: "available",
    createdAt: "2026-02-25 14:20",
    updatedAt: "2026-02-26 10:45",
  },
  {
    id: "RNT-CAR-BMW-330E-002",
    name: "BMW 330e M Sport",
    carImage: "/cosySec2.webp",
    type: "Sedan",
    seats: 5,
    transmission: "Auto",
    fuel: "Hybrid",
    pricePerDay: 1490,
    badge: "Popular",
    status: "available",
    createdAt: "2026-02-26 09:15",
    updatedAt: "2026-02-26 09:15",
  },
  {
    id: "RNT-CAR-BMW-M3CS-003",
    name: "BMW M3 CS",
    carImage: "/cosySec3.webp",
    type: "SUV",
    seats: 5,
    transmission: "Auto",
    fuel: "Gasoline",
    pricePerDay: 1990,
    badge: "Popular",
    status: "rented",
    createdAt: "2026-02-26 16:00",
    updatedAt: "2026-02-27 08:30",
  },
  {
    id: "RNT-CAR-BMW-I5E40-004",
    name: "BMW i5 eDrive40 M Sport",
    carImage: "/cosySec4.webp",
    type: "Sedan",
    seats: 5,
    transmission: "Auto",
    fuel: "EV",
    pricePerDay: 1590,
    badge: "New",
    status: "maintenance",
    createdAt: "2026-02-27 11:10",
    updatedAt: "2026-02-27 11:10",
  },
  {
    id: "RNT-CAR-BMW-I5M60-005",
    name: "BMW i5 M60 xDrive",
    carImage: "/cosySec1.webp",
    type: "Van",
    seats: 5,
    transmission: "Auto",
    fuel: "EV",
    pricePerDay: 1790,
    badge: "Popular",
    status: "hidden",
    createdAt: "2026-02-27 13:40",
    updatedAt: "2026-02-27 14:00",
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

function slugModel(name: string) {
  return name
    .toUpperCase()
    .replace(/BMW/g, "")
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
}

function makeNextCarId(rows: CarRow[], name: string) {
  const nums = rows
    .map((r) => {
      const parts = r.id.split("-");
      const last = parts[parts.length - 1];
      return Number(last);
    })
    .filter((n) => Number.isFinite(n));

  const next = nums.length ? Math.max(...nums) + 1 : 1;
  const modelCode = slugModel(name) || "CAR";
  return `CAR-BMW-${modelCode}-${String(next).padStart(3, "0")}`;
}

function getCarStatusMeta(status: CarStatus) {
  const map: Record<
    CarStatus,
    {
      label: string;
      color: "default" | "success" | "warning" | "error";
      tone: "emerald" | "amber" | "rose" | "slate";
    }
  > = {
    available: { label: "พร้อมให้เช่า", color: "success", tone: "emerald" },
    rented: { label: "ถูกเช่าอยู่", color: "warning", tone: "amber" },
    maintenance: { label: "ซ่อมบำรุง", color: "error", tone: "rose" },
    hidden: { label: "ซ่อน", color: "default", tone: "slate" },
  };

  return map[status];
}

function statusChipSX(tone: ReturnType<typeof getCarStatusMeta>["tone"]) {
  if (tone === "emerald") {
    return {
      border: "1px solid rgb(167 243 208)",
      bgcolor: "rgb(209 250 229)",
      color: "rgb(6 95 70)",
    };
  }

  if (tone === "amber") {
    return {
      border: "1px solid rgb(253 230 138)",
      bgcolor: "rgb(254 243 199)",
      color: "rgb(146 64 14)",
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

function StatusChip({ s }: { s: CarStatus }) {
  const m = getCarStatusMeta(s);

  return (
    <Chip
      size="small"
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
  width = 72,
  height = 52,
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
          <DirectionsCarRoundedIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}

export default function AdminCarsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [rowsData, setRowsData] = React.useState<CarRow[]>(SEED);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<CarStatus | "all">("all");

  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedCarId, setSelectedCarId] = React.useState<string | null>(null);

  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState<CarType>("Sedan");
  const [editSeats, setEditSeats] = React.useState<number>(5);
  const [editTransmission, setEditTransmission] =
    React.useState<Transmission>("Auto");
  const [editFuel, setEditFuel] = React.useState<Fuel>("Gasoline");
  const [editPricePerDay, setEditPricePerDay] = React.useState<number>(0);
  const [editBadge, setEditBadge] = React.useState("");
  const [editImage, setEditImage] = React.useState("");

  const [nextStatus, setNextStatus] = React.useState<CarStatus>("available");

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const selectedCar = React.useMemo(
    () => rowsData.find((item) => item.id === selectedCarId) ?? null,
    [rowsData, selectedCarId]
  );

  const rows = React.useMemo(() => {
    return rowsData.filter((r) => {
      const keyword = q.toLowerCase();
      const okQ =
        !q ||
        r.id.toLowerCase().includes(keyword) ||
        r.name.toLowerCase().includes(keyword) ||
        r.type.toLowerCase().includes(keyword);
      const okS = status === "all" ? true : r.status === status;
      return okQ && okS;
    });
  }, [q, status, rowsData]);

  const openCreateDrawer = () => {
    setSelectedCarId(null);
    setEditName("");
    setEditType("Sedan");
    setEditSeats(5);
    setEditTransmission("Auto");
    setEditFuel("Gasoline");
    setEditPricePerDay(0);
    setEditBadge("");
    setEditImage("/cosySec1.webp");
    setDrawerMode("create");
  };

  const openDetailDrawer = (car: CarRow) => {
    setSelectedCarId(car.id);
    setEditName(car.name);
    setEditType(car.type);
    setEditSeats(car.seats);
    setEditTransmission(car.transmission);
    setEditFuel(car.fuel);
    setEditPricePerDay(car.pricePerDay);
    setEditBadge(car.badge ?? "");
    setEditImage(car.carImage ?? "");
    setDrawerMode("detail");
  };

  const openStatusDrawer = (car: CarRow) => {
    setSelectedCarId(car.id);
    setNextStatus(car.status);
    setDrawerMode("status");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
  };

  const handleDrawerExited = () => {
    setSelectedCarId(null);
    setEditName("");
    setEditType("Sedan");
    setEditSeats(5);
    setEditTransmission("Auto");
    setEditFuel("Gasoline");
    setEditPricePerDay(0);
    setEditBadge("");
    setEditImage("");
    setNextStatus("available");
  };

  const saveCarDetail = () => {
    if (!selectedCar) return;

    if (!editName.trim()) {
      setSnack({
        open: true,
        msg: "กรุณาระบุชื่อรถ",
        type: "error",
      });
      return;
    }

    const now = getNowString();

    setRowsData((prev) =>
      prev.map((item) =>
        item.id === selectedCar.id
          ? {
              ...item,
              name: editName.trim(),
              carImage: editImage.trim() || undefined,
              type: editType,
              seats: editSeats,
              transmission: editTransmission,
              fuel: editFuel,
              pricePerDay: Number(editPricePerDay) || 0,
              badge: editBadge.trim() || undefined,
              updatedAt: now,
            }
          : item
      )
    );

    setSnack({
      open: true,
      msg: "บันทึกข้อมูลรถเรียบร้อย",
      type: "success",
    });
    setDrawerMode(null);
  };

  const createCar = () => {
    if (!editName.trim()) {
      setSnack({
        open: true,
        msg: "กรุณาระบุชื่อรถ",
        type: "error",
      });
      return;
    }

    const now = getNowString();

    const newCar: CarRow = {
      id: makeNextCarId(rowsData, editName),
      name: editName.trim(),
      carImage: editImage.trim() || undefined,
      type: editType,
      seats: editSeats,
      transmission: editTransmission,
      fuel: editFuel,
      pricePerDay: Number(editPricePerDay) || 0,
      badge: editBadge.trim() || undefined,
      status: "available",
      createdAt: now,
      updatedAt: now,
    };

    setRowsData((prev) => [newCar, ...prev]);
    setSnack({
      open: true,
      msg: "เพิ่มรถใหม่เรียบร้อย",
      type: "success",
    });
    setDrawerMode(null);
  };

  const saveCarForm = () => {
    if (drawerMode === "create") {
      createCar();
      return;
    }
    saveCarDetail();
  };

  const saveCarStatus = () => {
    if (!selectedCar) return;

    const now = getNowString();

    setRowsData((prev) =>
      prev.map((item) =>
        item.id === selectedCar.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: now,
            }
          : item
      )
    );

    setSnack({
      open: true,
      msg: `อัปเดตสถานะเป็น "${getCarStatusMeta(nextStatus).label}" สำเร็จ`,
      type: "success",
    });
    setDrawerMode(null);
  };

  const quickActions: Array<{
    label: string;
    status: CarStatus;
    variant: "contained" | "outlined";
    sx: object;
    icon: React.ReactNode;
  }> = [
    {
      label: "พร้อมให้เช่า",
      status: "available",
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
      label: "ถูกเช่าอยู่",
      status: "rented",
      variant: "outlined",
      icon: <CarRentalRoundedIcon />,
      sx: {
        textTransform: "none",
        borderColor: "rgb(253 224 71)",
        color: "rgb(146 64 14)",
        "&:hover": {
          borderColor: "rgb(234 179 8)",
          bgcolor: "rgb(254 249 195)",
        },
      },
    },
    {
      label: "ซ่อมบำรุง",
      status: "maintenance",
      variant: "outlined",
      icon: <BuildRoundedIcon />,
      sx: {
        textTransform: "none",
        borderColor: "rgb(252 165 165)",
        color: "rgb(185 28 28)",
        "&:hover": {
          borderColor: "rgb(248 113 113)",
          bgcolor: "rgb(254 242 242)",
        },
      },
    },
    {
      label: "ซ่อน",
      status: "hidden",
      variant: "outlined",
      icon: <VisibilityOffRoundedIcon />,
      sx: {
        textTransform: "none",
        borderColor: "rgb(203 213 225)",
        color: "rgb(71 85 105)",
        "&:hover": {
          borderColor: "rgb(148 163 184)",
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
              รถ
            </Typography>
            <Typography className="text-sm text-slate-600">
              จัดการข้อมูลรถ ราคา และสถานะการใช้งาน
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            className="w-full md:w-auto"
          >
            <TextField
              size="small"
              label="ค้นหา (รหัส/ชื่อรถ/ประเภท)"
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
              onChange={(e) => setStatus(e.target.value as CarStatus | "all")}
              className="w-full sm:w-45"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                },
              }}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="available">พร้อมให้เช่า</MenuItem>
              <MenuItem value="rented">ถูกเช่าอยู่</MenuItem>
              <MenuItem value="maintenance">ซ่อมบำรุง</MenuItem>
              <MenuItem value="hidden">ซ่อน</MenuItem>
            </TextField>

            <Button
              variant="contained"
              size="small"
              onClick={openCreateDrawer}
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
              + เพิ่มรถ
            </Button>
          </Stack>
        </Stack>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-0">
            <Box className="grid">
              {rows.map((c, idx) => (
                <Box key={c.id}>
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
                          {c.carImage ? (
                            <Box
                              component="img"
                              src={c.carImage}
                              alt={c.name}
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
                              {c.id}
                            </Typography>

                            <StatusChip s={c.status} />

                            {c.badge ? (
                              <Chip
                                size="small"
                                label={c.badge}
                                variant="outlined"
                              />
                            ) : null}
                          </Stack>

                          <Typography className="mt-1 text-lg font-bold text-slate-800">
                            {c.name}
                          </Typography>

                          <Divider className="my-2! border-slate-200!" />

                          <Typography className="text-xs text-slate-500">
                            ประเภท:{" "}
                            <span className="font-medium text-slate-700">
                              {c.type}
                            </span>
                            {" • "}
                            ที่นั่ง:{" "}
                            <span className="font-medium text-slate-700">
                              {c.seats}
                            </span>
                          </Typography>

                          <Typography className="mt-1 text-xs text-slate-500">
                            เกียร์:{" "}
                            <span className="font-medium text-slate-700">
                              {c.transmission}
                            </span>
                            {" • "}
                            เชื้อเพลิง:{" "}
                            <span className="font-medium text-slate-700">
                              {c.fuel}
                            </span>
                          </Typography>

                          <Typography className="mt-1 text-xs text-slate-500">
                            สร้างเมื่อ{" "}
                            <span className="font-medium text-slate-700">
                              {c.createdAt ?? "-"}
                            </span>
                            {" • "}
                            อัปเดตล่าสุด{" "}
                            <span className="font-medium text-slate-700">
                              {c.updatedAt ?? "-"}
                            </span>
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
                            ราคา / วัน
                          </Typography>
                          <Typography className="text-sm font-semibold text-slate-900">
                            {formatTHB(c.pricePerDay)}
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
                            onClick={() => openDetailDrawer(c)}
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
                            onClick={() => openStatusDrawer(c)}
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
                  {drawerMode === "create"
                    ? "เพิ่มรถใหม่"
                    : drawerMode === "detail"
                    ? "รายละเอียดรถ"
                    : "เปลี่ยนสถานะรถ"}
                </Typography>
                <Typography className="text-xs text-slate-500">
                  {drawerMode === "create"
                    ? "กรอกข้อมูลรถคันใหม่"
                    : selectedCar
                    ? `${selectedCar.id} • ${selectedCar.name}`
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

          {(drawerMode === "create" ||
            (drawerMode === "detail" && selectedCar)) && (
            <Stack spacing={2}>
              <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Box
                  className="relative bg-linear-to-br from-slate-900 to-slate-700"
                  sx={{ minHeight: 220 }}
                >
                  {drawerMode === "detail" && selectedCar?.carImage ? (
                    <Box
                      component="img"
                      src={selectedCar.carImage}
                      alt={selectedCar.name}
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        display: "block",
                        opacity: 0.5,
                      }}
                    />
                  ) : editImage ? (
                    <Box
                      component="img"
                      src={editImage}
                      alt={editName || "รถคันใหม่"}
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
                      {drawerMode === "create" ? "New Car" : "Car Overview"}
                    </Typography>

                    <Typography className="mt-2 text-xl font-extrabold">
                      {drawerMode === "create"
                        ? editName || "รถคันใหม่"
                        : selectedCar?.name}
                    </Typography>

                    <Typography className="mt-2 text-sm text-slate-200">
                      {editType} • {editSeats} ที่นั่ง • {editTransmission}
                    </Typography>

                    <Typography className="mt-4 text-sm text-slate-300">
                      ราคา / วัน
                    </Typography>
                    <Typography className="text-2xl font-extrabold">
                      {formatTHB(Number(editPricePerDay) || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SectionCard title="ข้อมูลหลัก">
                  <TextField
                    fullWidth
                    label="ชื่อรถ"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Badge"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="รูปภาพ (path)"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="/cosySec1.webp"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </SectionCard>

                <SectionCard title="ประเภทรถ">
                  <TextField
                    select
                    fullWidth
                    label="ประเภท"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as CarType)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="Economy">Economy</MenuItem>
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    type="number"
                    label="จำนวนที่นั่ง"
                    value={editSeats}
                    onChange={(e) => setEditSeats(Number(e.target.value))}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                </SectionCard>

                <SectionCard title="ระบบขับเคลื่อน">
                  <TextField
                    select
                    fullWidth
                    label="เกียร์"
                    value={editTransmission}
                    onChange={(e) =>
                      setEditTransmission(e.target.value as Transmission)
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="Auto">Auto</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="เชื้อเพลิง"
                    value={editFuel}
                    onChange={(e) => setEditFuel(e.target.value as Fuel)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  >
                    <MenuItem value="Gasoline">Gasoline</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="EV">EV</MenuItem>
                  </TextField>
                </SectionCard>

                <SectionCard title="ราคา">
                  <TextField
                    fullWidth
                    type="number"
                    label="ราคา / วัน"
                    value={editPricePerDay}
                    onChange={(e) => setEditPricePerDay(Number(e.target.value))}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
                  />
                  {drawerMode === "detail" && selectedCar ? (
                    <InfoRow
                      label="สถานะปัจจุบัน"
                      value={<StatusChip s={selectedCar.status} />}
                    />
                  ) : null}
                </SectionCard>

                {drawerMode === "detail" && selectedCar ? (
                  <>
                    <SectionCard title="ข้อมูลระบบ">
                      <InfoRow label="รหัสรถ" value={selectedCar.id} />
                      <InfoRow
                        label="วันที่สร้าง"
                        value={selectedCar.createdAt ?? "-"}
                      />
                      <InfoRow
                        label="อัปเดตล่าสุด"
                        value={selectedCar.updatedAt ?? "-"}
                      />
                    </SectionCard>

                    <SectionCard title="สรุปข้อมูลรถ">
                      <InfoRow label="รุ่นรถ" value={selectedCar.name} />
                      <InfoRow label="ประเภท" value={selectedCar.type} />
                      <InfoRow
                        label="ที่นั่ง"
                        value={`${selectedCar.seats} ที่นั่ง`}
                      />
                      <InfoRow label="เชื้อเพลิง" value={selectedCar.fuel} />
                    </SectionCard>
                  </>
                ) : null}
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
                  onClick={saveCarForm}
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
                  {drawerMode === "create" ? "เพิ่มรถ" : "บันทึกข้อมูล"}
                </Button>
              </Stack>
            </Stack>
          )}

          {drawerMode === "status" && selectedCar ? (
            <Stack spacing={2}>
              <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                <Stack direction="row" spacing={1} className="items-center">
                  <Typography className="text-sm font-bold text-slate-900">
                    สถานะปัจจุบัน
                  </Typography>
                  <StatusChip s={selectedCar.status} />
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
                  onClick={saveCarStatus}
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
