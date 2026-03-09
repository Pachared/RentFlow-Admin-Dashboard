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
  Tooltip,
  Switch,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import type { SwitchProps } from "@mui/material/Switch";

import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import SouthRoundedIcon from "@mui/icons-material/SouthRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RoomRoundedIcon from "@mui/icons-material/RoomRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

type DrawerMode = "create" | "detail" | "status" | "delete" | null;
type BranchType = "airport" | "storefront" | "meeting_point";
type BranchFilterStatus = "all" | "active" | "inactive";

type Branch = {
  id: string;
  name: string;
  address: string;
  active: boolean;
  displayOrder: number;
  type: BranchType;
  lat: string;
  lng: string;
  pickupAvailable: boolean;
  returnAvailable: boolean;
  openTime: string;
  closeTime: string;
  extraFee: number;
  createdAt?: string;
  updatedAt?: string;
};

type MockPlaceResult = {
  label: string;
  address: string;
  lat: string;
  lng: string;
};

const MOCK_PLACE_RESULTS: MockPlaceResult[] = [
  {
    label: "สนามบินดอนเมือง",
    address: "สนามบินดอนเมือง กรุงเทพฯ",
    lat: "13.9126",
    lng: "100.6067",
  },
  {
    label: "สนามบินสุวรรณภูมิ",
    address: "สนามบินสุวรรณภูมิ สมุทรปราการ",
    lat: "13.6900",
    lng: "100.7501",
  },
  {
    label: "รัชดา",
    address: "ถนนรัชดาภิเษก กรุงเทพฯ",
    lat: "13.7773",
    lng: "100.5736",
  },
  {
    label: "เซ็นทรัลลาดพร้าว",
    address: "จตุจักร กรุงเทพฯ",
    lat: "13.8163",
    lng: "100.5618",
  },
  {
    label: "สุพรรณบุรี",
    address: "ตัวเมืองสุพรรณบุรี",
    lat: "14.4742",
    lng: "100.1177",
  },
];

function makeNextBranchId(rows: Branch[]) {
  const nums = rows
    .map((r) => Number(r.id.replace(/[^\d]/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `B${String(next).padStart(3, "0")}`;
}

function getNextDisplayOrder(rows: Branch[]) {
  if (!rows.length) return 1;
  return Math.max(...rows.map((r) => r.displayOrder)) + 1;
}

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

function branchTypeLabel(type: BranchType) {
  if (type === "airport") return "สนามบิน";
  if (type === "storefront") return "หน้าร้าน";
  return "จุดนัดรับ";
}

function buildGoogleMapsUrl(lat?: string, lng?: string) {
  if (!lat?.trim() || !lng?.trim()) return "";
  return `https://maps.google.com/?q=${lat.trim()},${lng.trim()}`;
}

function getBranchStatusMeta(active: boolean) {
  return active
    ? { label: "เปิดใช้งาน", tone: "emerald" as const }
    : { label: "ปิดใช้งาน", tone: "slate" as const };
}

function statusChipSX(tone: "emerald" | "amber" | "slate") {
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

  return {
    border: "1px solid rgb(226 232 240)",
    bgcolor: "rgb(248 250 252)",
    color: "rgb(51 65 85)",
  };
}

function BranchStatusChip({ active }: { active: boolean }) {
  const meta = getBranchStatusMeta(active);

  return (
    <Chip
      size="medium"
      label={meta.label}
      variant="outlined"
      sx={statusChipSX(meta.tone)}
    />
  );
}

function BranchTypeChip({ type }: { type: BranchType }) {
  const sx =
    type === "airport"
      ? {
          border: "1px solid rgb(186 230 253)",
          bgcolor: "rgb(224 242 254)",
          color: "rgb(3 105 161)",
        }
      : type === "storefront"
      ? {
          border: "1px solid rgb(167 243 208)",
          bgcolor: "rgb(209 250 229)",
          color: "rgb(6 95 70)",
        }
      : {
          border: "1px solid rgb(226 232 240)",
          bgcolor: "rgb(248 250 252)",
          color: "rgb(51 65 85)",
        };

  return (
    <Chip
      size="medium"
      label={branchTypeLabel(type)}
      variant="outlined"
      sx={sx}
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
      <Divider className="my-3! border-slate-200!" />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function AdminLocationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [branchesEnabled, setBranchesEnabled] = React.useState(true);

  const [branches, setBranches] = React.useState<Branch[]>([
    {
      id: "B001",
      name: "สาขากรุงเทพฯ",
      address: "รัชดา กรุงเทพฯ",
      active: true,
      displayOrder: 1,
      type: "storefront",
      lat: "13.7563",
      lng: "100.5018",
      pickupAvailable: true,
      returnAvailable: true,
      openTime: "08:00",
      closeTime: "20:00",
      extraFee: 0,
      createdAt: "2026-03-01 09:30",
      updatedAt: "2026-03-02 11:20",
    },
    {
      id: "B002",
      name: "สนามบินดอนเมือง",
      address: "สนามบินดอนเมือง กรุงเทพฯ",
      active: true,
      displayOrder: 2,
      type: "airport",
      lat: "13.9126",
      lng: "100.6067",
      pickupAvailable: true,
      returnAvailable: true,
      openTime: "06:00",
      closeTime: "23:00",
      extraFee: 300,
      createdAt: "2026-03-01 10:10",
      updatedAt: "2026-03-01 10:10",
    },
  ]);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<BranchFilterStatus>("all");

  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(
    null
  );

  const [editName, setEditName] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editActive, setEditActive] = React.useState(true);
  const [editDisplayOrder, setEditDisplayOrder] = React.useState<number>(1);
  const [editType, setEditType] = React.useState<BranchType>("storefront");
  const [editLat, setEditLat] = React.useState("");
  const [editLng, setEditLng] = React.useState("");
  const [editPickupAvailable, setEditPickupAvailable] = React.useState(true);
  const [editReturnAvailable, setEditReturnAvailable] = React.useState(true);
  const [editOpenTime, setEditOpenTime] = React.useState("08:00");
  const [editCloseTime, setEditCloseTime] = React.useState("20:00");
  const [editExtraFee, setEditExtraFee] = React.useState<number>(0);
  const [mapQuery, setMapQuery] = React.useState("");
  const [nextActive, setNextActive] = React.useState(true);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const selectedBranch = React.useMemo(
    () => branches.find((b) => b.id === selectedBranchId) ?? null,
    [branches, selectedBranchId]
  );

  const activeCount = branches.filter((b) => b.active).length;

  const sortedBranches = React.useMemo(() => {
    return [...branches].sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });
  }, [branches]);

  const rows = React.useMemo(() => {
    return sortedBranches.filter((b) => {
      const keyword = q.trim().toLowerCase();

      const okQ =
        !keyword ||
        b.id.toLowerCase().includes(keyword) ||
        b.name.toLowerCase().includes(keyword) ||
        b.address.toLowerCase().includes(keyword) ||
        branchTypeLabel(b.type).toLowerCase().includes(keyword);

      const okStatus =
        status === "all" ? true : status === "active" ? b.active : !b.active;

      return okQ && okStatus;
    });
  }, [sortedBranches, q, status]);

  const placeResults = React.useMemo(() => {
    const query = mapQuery.trim().toLowerCase();
    if (!query) return [];
    return MOCK_PLACE_RESULTS.filter(
      (p) =>
        p.label.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [mapQuery]);

  const roundedFieldSX = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
    },
  };

  const normalizeDisplayOrders = (rows: Branch[]) => {
    const sorted = [...rows].sort((a, b) => a.displayOrder - b.displayOrder);
    return sorted.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));
  };

  const openCreateDrawer = () => {
    setSelectedBranchId(null);
    setEditName("");
    setEditAddress("");
    setEditActive(true);
    setEditDisplayOrder(getNextDisplayOrder(branches));
    setEditType("storefront");
    setEditLat("");
    setEditLng("");
    setEditPickupAvailable(true);
    setEditReturnAvailable(true);
    setEditOpenTime("08:00");
    setEditCloseTime("20:00");
    setEditExtraFee(0);
    setMapQuery("");
    setDrawerMode("create");
  };

  const openDetailDrawer = (branch: Branch) => {
    setSelectedBranchId(branch.id);
    setEditName(branch.name);
    setEditAddress(branch.address);
    setEditActive(branch.active);
    setEditDisplayOrder(branch.displayOrder);
    setEditType(branch.type);
    setEditLat(branch.lat);
    setEditLng(branch.lng);
    setEditPickupAvailable(branch.pickupAvailable);
    setEditReturnAvailable(branch.returnAvailable);
    setEditOpenTime(branch.openTime);
    setEditCloseTime(branch.closeTime);
    setEditExtraFee(branch.extraFee);
    setMapQuery("");
    setDrawerMode("detail");
  };

  const openStatusDrawer = (branch: Branch) => {
    setSelectedBranchId(branch.id);
    setNextActive(branch.active);
    setDrawerMode("status");
  };

  const openDeleteDrawer = (branch: Branch) => {
    setSelectedBranchId(branch.id);
    setDrawerMode("delete");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
  };

  const handleDrawerExited = () => {
    setSelectedBranchId(null);
    setEditName("");
    setEditAddress("");
    setEditActive(true);
    setEditDisplayOrder(1);
    setEditType("storefront");
    setEditLat("");
    setEditLng("");
    setEditPickupAvailable(true);
    setEditReturnAvailable(true);
    setEditOpenTime("08:00");
    setEditCloseTime("20:00");
    setEditExtraFee(0);
    setMapQuery("");
    setNextActive(true);
  };

  const moveBranch = (id: string, direction: "up" | "down") => {
    const sorted = [...sortedBranches];
    const index = sorted.findIndex((b) => b.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[swapIndex];
    const currentOrder = current.displayOrder;
    current.displayOrder = target.displayOrder;
    target.displayOrder = currentOrder;

    setBranches(normalizeDisplayOrders(sorted));
  };

  const applyPlaceResult = (place: MockPlaceResult) => {
    setEditAddress(place.address);
    setEditLat(place.lat);
    setEditLng(place.lng);
    if (!editName.trim()) {
      setEditName(place.label);
    }
    setMapQuery(place.label);
  };

  const validateBranch = () => {
    if (!editName.trim()) {
      setSnack({ open: true, msg: "กรุณาระบุชื่อสาขา", type: "error" });
      return false;
    }

    if (!editPickupAvailable && !editReturnAvailable) {
      setSnack({
        open: true,
        msg: "อย่างน้อยต้องเปิดรับรถหรือคืนรถอย่างใดอย่างหนึ่ง",
        type: "error",
      });
      return false;
    }

    if (!editOpenTime || !editCloseTime) {
      setSnack({
        open: true,
        msg: "กรุณาระบุเวลาเปิด-ปิด",
        type: "error",
      });
      return false;
    }

    if (Number(editExtraFee) < 0) {
      setSnack({
        open: true,
        msg: "ค่าบริการเพิ่มต้องไม่ติดลบ",
        type: "error",
      });
      return false;
    }

    return true;
  };

  const createBranch = () => {
    if (!validateBranch()) return;

    const now = getNowString();

    const newBranch: Branch = {
      id: makeNextBranchId(branches),
      name: editName.trim(),
      address: editAddress.trim(),
      active: editActive,
      displayOrder: Number(editDisplayOrder) || getNextDisplayOrder(branches),
      type: editType,
      lat: editLat.trim(),
      lng: editLng.trim(),
      pickupAvailable: editPickupAvailable,
      returnAvailable: editReturnAvailable,
      openTime: editOpenTime,
      closeTime: editCloseTime,
      extraFee: Number(editExtraFee) || 0,
      createdAt: now,
      updatedAt: now,
    };

    const nextRows = normalizeDisplayOrders([...branches, newBranch]);
    setBranches(nextRows);
    setDrawerMode(null);
    setSnack({ open: true, msg: "เพิ่มสาขาใหม่เรียบร้อย", type: "success" });
  };

  const saveBranchDetail = () => {
    if (!selectedBranch) return;
    if (!validateBranch()) return;

    const now = getNowString();

    const updatedRows = branches.map((b) =>
      b.id === selectedBranch.id
        ? {
            ...b,
            name: editName.trim(),
            address: editAddress.trim(),
            active: editActive,
            displayOrder: Number(editDisplayOrder) || 1,
            type: editType,
            lat: editLat.trim(),
            lng: editLng.trim(),
            pickupAvailable: editPickupAvailable,
            returnAvailable: editReturnAvailable,
            openTime: editOpenTime,
            closeTime: editCloseTime,
            extraFee: Number(editExtraFee) || 0,
            updatedAt: now,
          }
        : b
    );

    setBranches(normalizeDisplayOrders(updatedRows));
    setDrawerMode(null);
    setSnack({ open: true, msg: "บันทึกข้อมูลสาขาเรียบร้อย", type: "success" });
  };

  const saveBranchForm = () => {
    if (drawerMode === "create") {
      createBranch();
      return;
    }
    saveBranchDetail();
  };

  const saveBranchStatus = () => {
    if (!selectedBranch) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === selectedBranch.id
          ? {
              ...b,
              active: nextActive,
              updatedAt: getNowString(),
            }
          : b
      )
    );

    setDrawerMode(null);
    setSnack({
      open: true,
      msg: nextActive ? "เปิดใช้งานสาขาแล้ว" : "ปิดใช้งานสาขาแล้ว",
      type: "success",
    });
  };

  const removeBranch = (id: string) => {
    const filtered = branches.filter((b) => b.id !== id);
    setBranches(normalizeDisplayOrders(filtered));
    setSnack({ open: true, msg: "ลบสาขาเรียบร้อย", type: "info" });
  };

  const quickActions = [
    {
      label: "เปิดใช้งาน",
      value: true,
      icon: <CheckCircleRoundedIcon />,
      variant: "contained" as const,
      sx: {
        textTransform: "none",
        bgcolor: "rgb(22 163 74)",
        boxShadow: "none",
        "&:hover": { bgcolor: "rgb(21 128 61)", boxShadow: "none" },
      },
    },
    {
      label: "ปิดใช้งาน",
      value: false,
      icon: <VisibilityOffRoundedIcon />,
      variant: "outlined" as const,
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
              จุดรับ-ส่ง / สาขา
            </Typography>
            <Typography className="text-sm text-slate-600">
              จัดการข้อมูลสาขา ลำดับการแสดง และสถานะการใช้งาน
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            className="w-full md:w-auto"
          >
            <TextField
              size="small"
              label="ค้นหา (รหัส/ชื่อสาขา/ประเภท)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full sm:w-70"
              sx={roundedFieldSX}
            />

            <TextField
              size="small"
              select
              label="สถานะ"
              value={status}
              onChange={(e) => setStatus(e.target.value as BranchFilterStatus)}
              className="w-full sm:w-45"
              sx={roundedFieldSX}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              <MenuItem value="active">เปิดใช้งาน</MenuItem>
              <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
            </TextField>

            <Button
              variant="contained"
              size="medium"
              onClick={openCreateDrawer}
              disabled={!branchesEnabled}
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
              + เพิ่มสาขาใหม่
            </Button>
          </Stack>
        </Stack>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-4!">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="items-start sm:items-center justify-between"
            >
              <Stack direction="row" spacing={1.25} className="items-center">
                <Box className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200">
                  <PlaceRoundedIcon fontSize="medium" />
                </Box>

                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    โหมดสาขา: {branchesEnabled ? "เปิด" : "ปิด"} • ทั้งหมด{" "}
                    {branches.length} รายการ • ใช้งาน {activeCount} รายการ
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    ปิด = ลูกค้าพิมพ์เอง / เปิด = ลูกค้าเลือกจากรายการสาขา
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} className="items-center">
                <Tooltip title="เปิด/ปิดโหมดสาขา">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Typography className="text-xs text-slate-600">
                      Enterprise Mode
                    </Typography>
                    <IOSSwitch
                      checked={branchesEnabled}
                      onChange={(e) => setBranchesEnabled(e.target.checked)}
                    />
                  </Stack>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {branchesEnabled ? (
          <Card
            elevation={0}
            className="rounded-2xl! border border-slate-200 bg-white"
          >
            <CardContent className="p-0">
              <Box className="grid">
                {rows.map((b, idx) => {
                  const mapsUrl = buildGoogleMapsUrl(b.lat, b.lng);

                  return (
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
                              <Box className="grid h-full w-full place-items-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-500">
                                {b.type === "airport" ? (
                                  <LocalShippingRoundedIcon
                                    sx={{ fontSize: 42 }}
                                  />
                                ) : (
                                  <PlaceRoundedIcon sx={{ fontSize: 42 }} />
                                )}
                              </Box>
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

                                <BranchStatusChip active={b.active} />
                                <BranchTypeChip type={b.type} />

                                <Chip
                                  size="medium"
                                  label={`ลำดับ ${b.displayOrder}`}
                                  variant="outlined"
                                />
                              </Stack>

                              <Typography className="mt-1 text-lg font-bold text-slate-800">
                                {b.name}
                              </Typography>

                              <Divider className="my-2! border-slate-200!" />

                              <Typography className="text-xs text-slate-500">
                                ที่อยู่:{" "}
                                <span className="font-medium text-slate-700">
                                  {b.address || "ยังไม่ได้ระบุ"}
                                </span>
                              </Typography>

                              <Typography className="mt-1 text-xs text-slate-500">
                                เวลาเปิด-ปิด:{" "}
                                <span className="font-medium text-slate-700">
                                  {b.openTime} - {b.closeTime}
                                </span>
                              </Typography>

                              <Typography className="mt-1 text-xs text-slate-500">
                                บริการ:{" "}
                                <span className="font-medium text-slate-700">
                                  {b.pickupAvailable
                                    ? "รับรถได้"
                                    : "รับรถไม่ได้"}
                                  {" • "}
                                  {b.returnAvailable
                                    ? "คืนรถได้"
                                    : "คืนรถไม่ได้"}
                                </span>
                              </Typography>

                              <Typography className="mt-1 text-xs text-slate-500">
                                พิกัด:{" "}
                                <span className="font-medium text-slate-700">
                                  {b.lat && b.lng
                                    ? `${b.lat}, ${b.lng}`
                                    : "ยังไม่ได้ระบุ"}
                                </span>
                              </Typography>

                              <Typography className="mt-1 text-xs text-slate-500">
                                สร้างเมื่อ{" "}
                                <span className="font-medium text-slate-700">
                                  {b.createdAt ?? "-"}
                                </span>
                                {" • "}
                                อัปเดตล่าสุด{" "}
                                <span className="font-medium text-slate-700">
                                  {b.updatedAt ?? "-"}
                                </span>
                              </Typography>

                              {mapsUrl ? (
                                <Box className="mt-2">
                                  <Button
                                    component="a"
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    size="medium"
                                    variant="outlined"
                                    startIcon={<OpenInNewRoundedIcon />}
                                    sx={{
                                      textTransform: "none",
                                      borderColor: "rgb(226 232 240)",
                                      borderRadius: 2,
                                    }}
                                  >
                                    เปิดแผนที่
                                  </Button>
                                </Box>
                              ) : null}
                            </Box>
                          </Stack>

                          <Stack
                            spacing={1.5}
                            className="w-full md:w-auto"
                            sx={{
                              minWidth: { md: 220 },
                            }}
                          >
                            <Box className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <Typography className="text-xs text-slate-500">
                                ค่าบริการเพิ่ม
                              </Typography>
                              <Typography className="text-sm font-semibold text-slate-900">
                                {b.extraFee > 0
                                  ? formatTHB(b.extraFee)
                                  : "ไม่มี"}
                              </Typography>
                            </Box>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              className="justify-end flex-wrap"
                            >
                              <Tooltip title="เลื่อนขึ้น">
                                <span>
                                  <IconButton
                                    onClick={() => moveBranch(b.id, "up")}
                                    disabled={idx === 0}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <NorthRoundedIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="เลื่อนลง">
                                <span>
                                  <IconButton
                                    onClick={() => moveBranch(b.id, "down")}
                                    disabled={idx === rows.length - 1}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    <SouthRoundedIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Button
                                size="medium"
                                variant="outlined"
                                color="error"
                                onClick={() => openDeleteDrawer(b)}
                                className="rounded-lg!"
                                startIcon={<DeleteOutlineRoundedIcon />}
                                sx={{
                                  textTransform: "none",
                                  borderRadius: 2.5,
                                }}
                              >
                                ลบสาขา
                              </Button>

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
                                แก้ไขรายละเอียด
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
                  );
                })}

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
        ) : (
          <Card
            elevation={0}
            className="rounded-2xl! border border-slate-200 bg-white"
          >
            <CardContent className="p-5">
              <Typography className="text-sm font-bold text-slate-900">
                ปิดโหมดสาขาอยู่
              </Typography>
              <Typography className="mt-1 text-xs text-slate-500">
                ลูกค้าจะพิมพ์สถานที่รับ/คืนเอง
                เหมาะกับธุรกิจที่รับ-คืนแบบยืดหยุ่น
              </Typography>
            </CardContent>
          </Card>
        )}
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
                        drawerMode === "create"
                          ? "rgb(239 246 255)"
                          : drawerMode === "detail"
                          ? "rgb(241 245 249)"
                          : drawerMode === "status"
                          ? "rgb(254 249 195)"
                          : "rgb(254 242 242)",
                      color:
                        drawerMode === "create"
                          ? "rgb(3 105 161)"
                          : drawerMode === "detail"
                          ? "rgb(15 23 42)"
                          : drawerMode === "status"
                          ? "rgb(146 64 14)"
                          : "rgb(185 28 28)",
                    }}
                  >
                    {drawerMode === "create" ? (
                      <PlaceRoundedIcon sx={{ fontSize: 20 }} />
                    ) : drawerMode === "detail" ? (
                      <PlaceRoundedIcon sx={{ fontSize: 20 }} />
                    ) : drawerMode === "status" ? (
                      <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                    )}
                  </Box>

                  <Box className="min-w-0">
                    <Typography className="truncate text-sm font-black text-slate-900">
                      {drawerMode === "create"
                        ? "เพิ่มสาขาใหม่"
                        : drawerMode === "detail"
                        ? "แก้ไขข้อมูลสาขา"
                        : drawerMode === "status"
                        ? "เปลี่ยนสถานะสาขา"
                        : "ยืนยันการลบสาขา"}
                    </Typography>

                    <Typography className="truncate text-xs text-slate-500">
                      {drawerMode === "create"
                        ? "กรอกข้อมูลสาขาใหม่"
                        : drawerMode === "delete"
                        ? "ตรวจสอบข้อมูลก่อนลบ"
                        : selectedBranch
                        ? `${selectedBranch.id} • ${selectedBranch.name}`
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
            {(drawerMode === "create" ||
              (drawerMode === "detail" && selectedBranch)) && (
              <Stack spacing={2}>
                <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white mb-1">
                  <Box
                    className="relative bg-linear-to-br from-slate-900 to-slate-700"
                    sx={{ minHeight: 220 }}
                  >
                    <Box className="grid h-55 w-full place-items-center text-slate-300">
                      <PlaceRoundedIcon sx={{ fontSize: 56 }} />
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
                        {drawerMode === "create"
                          ? "New Branch"
                          : "Branch Overview"}
                      </Typography>

                      <Typography className="mt-2 text-xl font-extrabold">
                        {editName || "สาขาใหม่"}
                      </Typography>

                      <Typography className="mt-2 text-sm text-slate-200">
                        {branchTypeLabel(editType)} • ลำดับ {editDisplayOrder}
                      </Typography>

                      <Typography className="mt-2 text-sm text-slate-300">
                        {editAddress || "ยังไม่ได้ระบุที่อยู่"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="ข้อมูลหลัก">
                    <TextField
                      fullWidth
                      label="ชื่อสาขา"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      sx={roundedFieldSX}
                    />

                    <TextField
                      fullWidth
                      label="ที่อยู่ / คำอธิบาย"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      sx={roundedFieldSX}
                    />

                    <TextField
                      select
                      fullWidth
                      label="ประเภทสาขา"
                      value={editType}
                      onChange={(e) =>
                        setEditType(e.target.value as BranchType)
                      }
                      sx={roundedFieldSX}
                    >
                      <MenuItem value="airport">สนามบิน</MenuItem>
                      <MenuItem value="storefront">หน้าร้าน</MenuItem>
                      <MenuItem value="meeting_point">จุดนัดรับ</MenuItem>
                    </TextField>
                  </SectionCard>

                  <SectionCard title="ลำดับและสถานะ">
                    <TextField
                      fullWidth
                      type="number"
                      label="ลำดับการแสดง"
                      value={editDisplayOrder}
                      onChange={(e) =>
                        setEditDisplayOrder(Number(e.target.value))
                      }
                      inputProps={{ min: 1 }}
                      sx={roundedFieldSX}
                    />

                    <Stack
                      direction="row"
                      spacing={1}
                      className="items-center justify-between"
                    >
                      <Typography className="text-sm font-medium text-slate-700">
                        เปิดใช้งาน
                      </Typography>
                      <IOSSwitch
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                      />
                    </Stack>

                    <InfoRow
                      label="สถานะ"
                      value={<BranchStatusChip active={editActive} />}
                    />
                  </SectionCard>

                  <SectionCard title="การให้บริการ">
                    <Stack
                      direction="row"
                      spacing={1}
                      className="items-center justify-between"
                    >
                      <Typography className="text-sm font-medium text-slate-700">
                        รับรถได้
                      </Typography>
                      <IOSSwitch
                        checked={editPickupAvailable}
                        onChange={(e) =>
                          setEditPickupAvailable(e.target.checked)
                        }
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      className="items-center justify-between"
                    >
                      <Typography className="text-sm font-medium text-slate-700">
                        คืนรถได้
                      </Typography>
                      <IOSSwitch
                        checked={editReturnAvailable}
                        onChange={(e) =>
                          setEditReturnAvailable(e.target.checked)
                        }
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      type="number"
                      label="ค่าบริการเพิ่ม (บาท)"
                      value={editExtraFee}
                      onChange={(e) => setEditExtraFee(Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      sx={roundedFieldSX}
                    />
                  </SectionCard>

                  <SectionCard title="เวลาเปิด-ปิด">
                    <TextField
                      fullWidth
                      type="time"
                      label="เวลาเปิด"
                      value={editOpenTime}
                      onChange={(e) => setEditOpenTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={roundedFieldSX}
                    />

                    <TextField
                      fullWidth
                      type="time"
                      label="เวลาปิด"
                      value={editCloseTime}
                      onChange={(e) => setEditCloseTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={roundedFieldSX}
                    />
                  </SectionCard>

                  <SectionCard title="ตำแหน่งบนแผนที่">
                    <TextField
                      fullWidth
                      label="ค้นหาสถานที่ (mock)"
                      value={mapQuery}
                      onChange={(e) => setMapQuery(e.target.value)}
                      placeholder="เช่น ดอนเมือง / รัชดา / สุพรรณบุรี"
                      sx={roundedFieldSX}
                      InputProps={{
                        startAdornment: (
                          <SearchRoundedIcon
                            sx={{ mr: 1, color: "rgb(100 116 139)" }}
                          />
                        ),
                      }}
                    />

                    {placeResults.length ? (
                      <Box className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <Stack spacing={1}>
                          {placeResults.map((place) => (
                            <Button
                              key={`${place.label}-${place.lat}-${place.lng}`}
                              variant="text"
                              onClick={() => applyPlaceResult(place)}
                              sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                borderRadius: 2,
                                color: "rgb(15 23 42)",
                              }}
                              startIcon={<RoomRoundedIcon />}
                            >
                              <Box className="text-left">
                                <Typography className="text-sm font-semibold text-slate-900">
                                  {place.label}
                                </Typography>
                                <Typography className="text-xs text-slate-500">
                                  {place.address}
                                </Typography>
                              </Box>
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    ) : null}

                    <TextField
                      fullWidth
                      label="Latitude"
                      value={editLat}
                      onChange={(e) => setEditLat(e.target.value)}
                      placeholder="เช่น 13.7563"
                      sx={roundedFieldSX}
                    />

                    <TextField
                      fullWidth
                      label="Longitude"
                      value={editLng}
                      onChange={(e) => setEditLng(e.target.value)}
                      placeholder="เช่น 100.5018"
                      sx={roundedFieldSX}
                    />

                    {buildGoogleMapsUrl(editLat, editLng) ? (
                      <Button
                        component="a"
                        href={buildGoogleMapsUrl(editLat, editLng)}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<OpenInNewRoundedIcon />}
                        sx={{
                          textTransform: "none",
                          borderColor: "rgb(226 232 240)",
                          borderRadius: 2.5,
                        }}
                      >
                        เปิดดูบน Google Maps
                      </Button>
                    ) : null}
                  </SectionCard>

                  <SectionCard title="สรุปข้อมูลสาขา">
                    <InfoRow label="ชื่อสาขา" value={editName || "-"} />
                    <InfoRow
                      label="ประเภท"
                      value={<BranchTypeChip type={editType} />}
                    />
                    <InfoRow label="ลำดับ" value={editDisplayOrder} />
                    <InfoRow
                      label="การให้บริการ"
                      value={`${
                        editPickupAvailable ? "รับรถได้" : "รับรถไม่ได้"
                      } • ${editReturnAvailable ? "คืนรถได้" : "คืนรถไม่ได้"}`}
                    />
                    <InfoRow
                      label="เวลาเปิด-ปิด"
                      value={`${editOpenTime} - ${editCloseTime}`}
                    />
                    <InfoRow
                      label="ค่าบริการเพิ่ม"
                      value={
                        editExtraFee > 0 ? formatTHB(editExtraFee) : "ไม่มี"
                      }
                    />
                  </SectionCard>

                  {drawerMode === "detail" && selectedBranch ? (
                    <SectionCard title="ข้อมูลระบบ">
                      <InfoRow label="รหัสสาขา" value={selectedBranch.id} />
                      <InfoRow
                        label="วันที่สร้าง"
                        value={selectedBranch.createdAt ?? "-"}
                      />
                      <InfoRow
                        label="อัปเดตล่าสุด"
                        value={selectedBranch.updatedAt ?? "-"}
                      />
                    </SectionCard>
                  ) : null}
                </Box>

                <Stack direction="row" spacing={2} className="pt-0.5">
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
                    onClick={saveBranchForm}
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
                    {drawerMode === "create" ? "เพิ่มสาขา" : "บันทึกข้อมูล"}
                  </Button>
                </Stack>
              </Stack>
            )}

            {drawerMode === "status" && selectedBranch ? (
              <Stack spacing={2}>
                <Box className="rounded-2xl border border-slate-200 bg-white p-4">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Typography className="text-sm font-bold text-slate-900">
                      สถานะปัจจุบัน
                    </Typography>
                    <BranchStatusChip active={selectedBranch.active} />
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
                      <BranchStatusChip active={nextActive} />
                    </Stack>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    className="mt-4"
                  >
                    {quickActions.map((action) => {
                      const isActive = nextActive === action.value;

                      return (
                        <Button
                          key={action.label}
                          variant={isActive ? "contained" : action.variant}
                          startIcon={action.icon}
                          onClick={() => setNextActive(action.value)}
                          sx={{
                            flex: 1,
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

                <Stack direction="row" spacing={2} className="pt-0.5">
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
                    onClick={saveBranchStatus}
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

            {drawerMode === "delete" && selectedBranch ? (
              <Stack spacing={2}>
                <Box className="overflow-hidden rounded-2xl border border-red-200 bg-white mb-1">
                  <Box
                    className="relative bg-linear-to-br from-red-900 to-rose-700"
                    sx={{ minHeight: 220 }}
                  >
                    <Box className="grid h-55 w-full place-items-center text-red-100">
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 60 }} />
                    </Box>

                    <Box
                      className="absolute inset-0"
                      sx={{
                        background:
                          "linear-gradient(to bottom, rgba(127,29,29,0.82), rgba(127,29,29,0.18))",
                      }}
                    />

                    <Box className="absolute inset-x-0 top-0 p-4 text-white">
                      <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-red-100/80">
                        Delete Branch
                      </Typography>

                      <Typography className="mt-2 text-xl font-extrabold">
                        ยืนยันการลบสาขา
                      </Typography>

                      <Typography className="mt-2 text-sm text-red-100">
                        รายการนี้จะถูกลบออกจากระบบทันที
                      </Typography>

                      <Typography className="mt-4 text-sm text-red-100/80">
                        รายการที่เลือก
                      </Typography>
                      <Typography className="text-2xl font-extrabold">
                        {selectedBranch.name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="ข้อมูลสาขา">
                    <InfoRow label="รหัสสาขา" value={selectedBranch.id} />
                    <InfoRow label="ชื่อสาขา" value={selectedBranch.name} />
                    <InfoRow
                      label="ประเภท"
                      value={<BranchTypeChip type={selectedBranch.type} />}
                    />
                    <InfoRow
                      label="ค่าบริการเพิ่ม"
                      value={
                        selectedBranch.extraFee > 0
                          ? formatTHB(selectedBranch.extraFee)
                          : "ไม่มี"
                      }
                    />
                  </SectionCard>

                  <SectionCard title="ผลกระทบ">
                    <Typography className="text-sm text-slate-700">
                      เมื่อลบแล้ว สาขานี้จะไม่สามารถเลือกใช้งานในระบบได้อีก
                    </Typography>
                    <Typography className="text-sm text-slate-700">
                      ตรวจสอบให้แน่ใจก่อนดำเนินการ
                    </Typography>
                  </SectionCard>
                </Box>

                <Stack direction="row" spacing={2} className="pt-0.5">
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
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => {
                      removeBranch(selectedBranch.id);
                      closeDrawer();
                    }}
                    sx={{
                      textTransform: "none",
                      boxShadow: "none",
                      borderRadius: 2.5,
                    }}
                  >
                    ยืนยันการลบ
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
