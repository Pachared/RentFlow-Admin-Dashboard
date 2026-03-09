"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Switch,
  Stack,
  Button,
  Chip,
  Tooltip,
  Drawer,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";

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

type DrawerMode = "create" | "detail" | "status" | null;
type BranchType = "airport" | "storefront" | "meeting_point";

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
  return `B${next}`;
}

function getNextDisplayOrder(rows: Branch[]) {
  if (!rows.length) return 1;
  return Math.max(...rows.map((r) => r.displayOrder)) + 1;
}

function formatTHB(n: number) {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value) + " บาท";
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

function BranchStatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Inactive"}
      sx={{
        height: 22,
        fontSize: 11,
        bgcolor: active ? "rgb(226 232 240)" : "rgb(241 245 249)",
        border: "1px solid rgb(226 232 240)",
        color: "rgb(30 41 59)",
        fontWeight: 800,
      }}
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
      size="small"
      label={branchTypeLabel(type)}
      sx={{
        ...sx,
        height: 22,
        fontSize: 11,
        fontWeight: 800,
      }}
    />
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]">
      <Typography className="text-sm font-medium text-slate-500">{label}</Typography>
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
      <Typography className="text-sm font-extrabold text-slate-900">{title}</Typography>
      <Divider className="my-3 border-slate-200!" />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

export default function AdminLocationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [branchesEnabled, setBranchesEnabled] = React.useState(true);

  const [branches, setBranches] = React.useState<Branch[]>([
    {
      id: "B1",
      name: "สาขากรุงเทพฯ",
      address: "รัชดา",
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
    },
    {
      id: "B2",
      name: "สนามบินดอนเมือง",
      address: "DMK",
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
    },
  ]);

  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(null);

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
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return a.name.localeCompare(b.name);
    });
  }, [branches]);

  const placeResults = React.useMemo(() => {
    const q = mapQuery.trim().toLowerCase();
    if (!q) return [];
    return MOCK_PLACE_RESULTS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [mapQuery]);

  const roundedFieldSX = {
    "& .MuiOutlinedInput-root": { borderRadius: "14px" },
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

  const normalizeDisplayOrders = (rows: Branch[]) => {
    const sorted = [...rows].sort((a, b) => a.displayOrder - b.displayOrder);
    return sorted.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));
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
    };

    const nextRows = normalizeDisplayOrders([...branches, newBranch]);
    setBranches(nextRows);
    setDrawerMode(null);
    setSnack({ open: true, msg: "เพิ่มสาขาใหม่เรียบร้อย", type: "success" });
  };

  const saveBranchDetail = () => {
    if (!selectedBranch) return;
    if (!validateBranch()) return;

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
        <Box>
          <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
            จัดการจุดรับ-ส่ง / สาขา
          </Typography>
          <Typography className="text-sm text-slate-600">
            เลือกโหมดใช้งานสาขา และจัดการรายการจุดรับ-ส่งที่ให้ลูกค้าเลือกได้
          </Typography>
        </Box>

        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
          <CardContent className="p-5">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="items-start sm:items-center justify-between"
            >
              <Stack direction="row" spacing={1.25} className="items-center">
                <Box className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
                  <PlaceRoundedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    โหมดสาขา: {branchesEnabled ? "เปิด" : "ปิด"} • ทั้งหมด {branches.length} • ใช้งาน {activeCount}
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    ปิด = ลูกค้าพิมพ์สถานที่เอง / เปิด = ลูกค้าเลือกจาก dropdown
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} className="items-center flex-wrap">
                <Tooltip title="เปิด/ปิดโหมดสาขา">
                  <Stack direction="row" spacing={1} className="items-center">
                    <Typography className="text-xs text-slate-600">Enterprise Mode</Typography>
                    <Switch
                      checked={branchesEnabled}
                      onChange={(e) => setBranchesEnabled(e.target.checked)}
                      size="small"
                    />
                  </Stack>
                </Tooltip>

                <Button
                  onClick={openCreateDrawer}
                  variant="contained"
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  sx={{
                    textTransform: "none",
                    bgcolor: "rgb(15 23 42)",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
                    borderRadius: 2,
                  }}
                  disabled={!branchesEnabled}
                >
                  เพิ่มสาขา
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {branchesEnabled ? (
          <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
            <CardContent className="p-0">
              <Box className="px-5 py-4 flex items-center justify-between">
                <Typography className="text-sm font-bold text-slate-900">
                  รายการสาขา / จุดรับ-ส่ง
                </Typography>
                <Typography className="text-xs text-slate-500">{sortedBranches.length} รายการ</Typography>
              </Box>

              <Divider className="border-slate-200!" />

              {sortedBranches.map((b, idx) => {
                const mapsUrl = buildGoogleMapsUrl(b.lat, b.lng);

                return (
                  <Box key={b.id} className="hover:bg-slate-50 transition-colors">
                    <Box className="p-5">
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        className="items-start justify-between"
                        sx={{ alignItems: { xs: "flex-start", md: "stretch" } }}
                      >
                        <Stack direction="row" spacing={1.5} className="items-start min-w-0 flex-1 w-full">
                          <Box className="grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-slate-50 shrink-0">
                            <PlaceRoundedIcon fontSize="small" />
                          </Box>

                          <Box className="min-w-0 flex-1">
                            <Stack direction="row" spacing={1} className="items-center flex-wrap">
                              <Typography className="text-sm font-extrabold text-slate-900 tracking-wide">
                                {b.id}
                              </Typography>
                              <BranchStatusChip active={b.active} />
                              <BranchTypeChip type={b.type} />
                              <Chip
                                size="small"
                                label={`ลำดับ ${b.displayOrder}`}
                                variant="outlined"
                                sx={{ height: 22, fontSize: 11 }}
                              />
                            </Stack>

                            <Typography className="mt-1 text-lg font-bold text-slate-800">
                              {b.name}
                            </Typography>

                            <Divider className="my-2 border-slate-200!" />

                            <Typography className="text-xs text-slate-500">
                              ที่อยู่: <span className="font-medium text-slate-700">{b.address || "ยังไม่ได้ระบุ"}</span>
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
                                {b.pickupAvailable ? "รับรถได้" : "รับรถไม่ได้"} •{" "}
                                {b.returnAvailable ? "คืนรถได้" : "คืนรถไม่ได้"}
                              </span>
                            </Typography>

                            <Typography className="mt-1 text-xs text-slate-500">
                              ค่าบริการเพิ่ม:{" "}
                              <span className="font-medium text-slate-700">
                                {b.extraFee > 0 ? formatTHB(b.extraFee) : "ไม่มี"}
                              </span>
                            </Typography>

                            <Typography className="mt-1 text-xs text-slate-500">
                              พิกัด:{" "}
                              <span className="font-medium text-slate-700">
                                {b.lat && b.lng ? `${b.lat}, ${b.lng}` : "ยังไม่ได้ระบุ"}
                              </span>
                            </Typography>

                            {mapsUrl ? (
                              <Box className="mt-2">
                                <Button
                                  component="a"
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  size="small"
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
                            minWidth: { md: 260 },
                            alignSelf: { xs: "stretch", md: "stretch" },
                          }}
                        >
                          <Box className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <Typography className="text-xs text-slate-500">สถานะ</Typography>
                            <Typography className="text-sm font-semibold text-slate-900">
                              {b.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} className="justify-end flex-wrap">
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
                                  disabled={idx === sortedBranches.length - 1}
                                  sx={{ borderRadius: 2 }}
                                >
                                  <SouthRoundedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Button
                              size="medium"
                              variant="outlined"
                              onClick={() => openDetailDrawer(b)}
                              sx={{
                                textTransform: "none",
                                borderColor: "rgb(226 232 240)",
                                borderRadius: 2.5,
                              }}
                            >
                              แก้ไข
                            </Button>

                            <Button
                              size="medium"
                              variant="contained"
                              onClick={() => openStatusDrawer(b)}
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
                              จัดการสถานะ
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>

                    {idx !== sortedBranches.length - 1 && <Divider className="border-slate-200!" />}
                  </Box>
                );
              })}

              {sortedBranches.length === 0 ? (
                <Box className="px-5 py-10 text-center">
                  <Typography className="text-sm font-semibold text-slate-900">ยังไม่มีสาขา</Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    กด “เพิ่มสาขา” เพื่อเริ่มต้น
                  </Typography>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
            <CardContent className="p-5">
              <Typography className="text-sm font-bold text-slate-900">
                ปิดโหมดสาขาอยู่
              </Typography>
              <Typography className="mt-1 text-xs text-slate-500">
                ลูกค้าจะพิมพ์สถานที่รับ/คืนเอง เหมาะกับธุรกิจที่รับ-คืนแบบยืดหยุ่น
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
          <CardContent className="p-5">
            <Typography className="text-sm font-bold text-slate-900">แนะนำการใช้งาน</Typography>
            <Typography className="mt-1 text-xs text-slate-500">
              ถ้ามีหลายจุดรับ-ส่ง เช่น สนามบินหรือหลายสาขา ให้เปิด Enterprise Mode และเปิด Active เฉพาะจุดที่พร้อมบริการ
            </Typography>
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
          <Stack direction="row" spacing={1.25} className="items-center justify-between">
            <Stack direction="row" spacing={1.25} className="items-center min-w-0">
              <Box className="min-w-0">
                <Typography className="text-sm font-black text-slate-900">
                  {drawerMode === "create"
                    ? "เพิ่มสาขาใหม่"
                    : drawerMode === "detail"
                      ? "แก้ไขข้อมูลสาขา"
                      : "จัดการสถานะสาขา"}
                </Typography>
                <Typography className="text-xs text-slate-500">
                  {drawerMode === "create"
                    ? "กรอกข้อมูลสาขาใหม่"
                    : selectedBranch
                      ? `${selectedBranch.id} • ${selectedBranch.name}`
                      : "-"}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={closeDrawer}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider className="my-4! border-slate-200!" />

          {(drawerMode === "create" || (drawerMode === "detail" && selectedBranch)) ? (
            <Stack spacing={2}>
              <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
                      {drawerMode === "create" ? "New Branch" : "Branch Overview"}
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
                    onChange={(e) => setEditType(e.target.value as BranchType)}
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
                    onChange={(e) => setEditDisplayOrder(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={roundedFieldSX}
                  />

                  <Stack direction="row" spacing={1} className="items-center justify-between">
                    <Typography className="text-sm font-medium text-slate-700">
                      เปิดใช้งาน
                    </Typography>
                    <Switch
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      size="small"
                    />
                  </Stack>

                  <InfoRow label="สถานะ" value={<BranchStatusChip active={editActive} />} />
                </SectionCard>

                <SectionCard title="การให้บริการ">
                  <Stack direction="row" spacing={1} className="items-center justify-between">
                    <Typography className="text-sm font-medium text-slate-700">
                      รับรถได้
                    </Typography>
                    <Switch
                      checked={editPickupAvailable}
                      onChange={(e) => setEditPickupAvailable(e.target.checked)}
                      size="small"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} className="items-center justify-between">
                    <Typography className="text-sm font-medium text-slate-700">
                      คืนรถได้
                    </Typography>
                    <Switch
                      checked={editReturnAvailable}
                      onChange={(e) => setEditReturnAvailable(e.target.checked)}
                      size="small"
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
                      startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "rgb(100 116 139)" }} />,
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

                <SectionCard title="สรุป">
                  <InfoRow label="ประเภท" value={<BranchTypeChip type={editType} />} />
                  <InfoRow label="ลำดับ" value={editDisplayOrder} />
                  <InfoRow
                    label="การให้บริการ"
                    value={`${editPickupAvailable ? "รับรถได้" : "รับรถไม่ได้"} • ${editReturnAvailable ? "คืนรถได้" : "คืนรถไม่ได้"
                      }`}
                  />
                  <InfoRow label="เวลาเปิด-ปิด" value={`${editOpenTime} - ${editCloseTime}`} />
                  <InfoRow
                    label="ค่าบริการเพิ่ม"
                    value={editExtraFee > 0 ? formatTHB(editExtraFee) : "ไม่มี"}
                  />
                  <InfoRow
                    label="พิกัด"
                    value={editLat && editLng ? `${editLat}, ${editLng}` : "ยังไม่ได้ระบุ"}
                  />
                </SectionCard>
              </Box>

              {drawerMode === "detail" && selectedBranch ? (
                <SectionCard title="จัดการรายการ">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => {
                        removeBranch(selectedBranch.id);
                        closeDrawer();
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                      }}
                    >
                      ลบสาขานี้
                    </Button>
                  </Stack>
                </SectionCard>
              ) : null}

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
          ) : null}

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

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} className="mt-4">
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
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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