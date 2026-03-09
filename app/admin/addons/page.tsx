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
  IconButton,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  Drawer,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

type PricingType = "perDay" | "perTrip";
type DrawerMode = "create" | "detail" | null;

type Addon = {
  id: string;
  title: string;
  price: number;
  pricingType: PricingType;
  inventoryTrack: boolean;
  stock: number | null;
  active: boolean;
};

function pricingLabel(t: PricingType) {
  return t === "perDay" ? "ต่อวัน" : "ต่อครั้ง";
}

function formatTHB(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return (
    new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(v) +
    " บาท"
  );
}

function makeNextAddonId(rows: Addon[]) {
  const nums = rows
    .map((r) => Number(r.id.replace(/[^\d]/g, "")))
    .filter((n) => Number.isFinite(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `A${next}`;
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

function AddonStatusChip({ active }: { active: boolean }) {
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

export default function AdminAddonsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [addons, setAddons] = React.useState<Addon[]>([
    {
      id: "A1",
      title: "คาร์ซีทเด็ก",
      price: 150,
      pricingType: "perDay",
      inventoryTrack: true,
      stock: 5,
      active: true,
    },
    {
      id: "A2",
      title: "คืนต่างสาขา",
      price: 500,
      pricingType: "perTrip",
      inventoryTrack: false,
      stock: null,
      active: true,
    },
  ]);

  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>(null);
  const [selectedAddonId, setSelectedAddonId] = React.useState<string | null>(
    null
  );

  const [editTitle, setEditTitle] = React.useState("");
  const [editPrice, setEditPrice] = React.useState<number>(0);
  const [editPricingType, setEditPricingType] =
    React.useState<PricingType>("perDay");
  const [editInventoryTrack, setEditInventoryTrack] = React.useState(false);
  const [editStock, setEditStock] = React.useState<number | null>(null);
  const [editActive, setEditActive] = React.useState(true);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const activeCount = addons.filter((a) => a.active).length;

  const selectedAddon = React.useMemo(
    () => addons.find((a) => a.id === selectedAddonId) ?? null,
    [addons, selectedAddonId]
  );

  const roundedFieldSX = {
    "& .MuiOutlinedInput-root": { borderRadius: "14px" },
  };

  const openCreateDrawer = () => {
    setSelectedAddonId(null);
    setEditTitle("");
    setEditPrice(0);
    setEditPricingType("perDay");
    setEditInventoryTrack(false);
    setEditStock(null);
    setEditActive(true);
    setDrawerMode("create");
  };

  const openDetailDrawer = (addon: Addon) => {
    setSelectedAddonId(addon.id);
    setEditTitle(addon.title);
    setEditPrice(addon.price);
    setEditPricingType(addon.pricingType);
    setEditInventoryTrack(addon.inventoryTrack);
    setEditStock(addon.stock);
    setEditActive(addon.active);
    setDrawerMode("detail");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
  };

  const handleDrawerExited = () => {
    setSelectedAddonId(null);
    setEditTitle("");
    setEditPrice(0);
    setEditPricingType("perDay");
    setEditInventoryTrack(false);
    setEditStock(null);
    setEditActive(true);
  };

  function removeAddon(id: string) {
    setAddons((prev) => prev.filter((a) => a.id !== id));
    setSnack({ open: true, msg: "ลบบริการเสริมแล้ว", type: "info" });
  }

  const saveAddonDetail = () => {
    if (!selectedAddon) return;

    if (!editTitle.trim()) {
      setSnack({ open: true, msg: "กรุณาระบุชื่อบริการ", type: "error" });
      return;
    }

    setAddons((prev) =>
      prev.map((a) =>
        a.id === selectedAddon.id
          ? {
              ...a,
              title: editTitle.trim(),
              price: Number(editPrice) || 0,
              pricingType: editPricingType,
              inventoryTrack: editInventoryTrack,
              stock: editInventoryTrack ? Number(editStock ?? 0) : null,
              active: editActive,
            }
          : a
      )
    );

    setDrawerMode(null);
    setSnack({
      open: true,
      msg: "บันทึกข้อมูลบริการเสริมเรียบร้อย",
      type: "success",
    });
  };

  const createAddon = () => {
    if (!editTitle.trim()) {
      setSnack({ open: true, msg: "กรุณาระบุชื่อบริการ", type: "error" });
      return;
    }

    const newAddon: Addon = {
      id: makeNextAddonId(addons),
      title: editTitle.trim(),
      price: Number(editPrice) || 0,
      pricingType: editPricingType,
      inventoryTrack: editInventoryTrack,
      stock: editInventoryTrack ? Number(editStock ?? 0) : null,
      active: editActive,
    };

    setAddons((prev) => [newAddon, ...prev]);
    setDrawerMode(null);
    setSnack({
      open: true,
      msg: "เพิ่มบริการเสริมใหม่เรียบร้อย",
      type: "success",
    });
  };

  const saveAddonForm = () => {
    if (drawerMode === "create") {
      createAddon();
      return;
    }
    saveAddonDetail();
  };

  return (
    <>
      <Box className="grid gap-4">
        <Box>
          <Typography
            variant="h6"
            className="text-xl font-extrabold text-slate-900"
          >
            บริการเสริม
          </Typography>
          <Typography className="text-sm text-slate-600">
            ตั้งราคา • เลือกว่าจะตัดสต็อกหรือไม่ • เปิด/ปิดการใช้งานแต่ละรายการ
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
                  <ExtensionRoundedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    ทั้งหมด {addons.length} รายการ • เปิดใช้งาน {activeCount}{" "}
                    รายการ
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    แนะนำ: เปิด “ตัดสต็อก” เฉพาะบริการที่มีจำนวนจำกัด เช่น
                    คาร์ซีทเด็ก
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
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
                >
                  เพิ่มบริการเสริม
                </Button>
              </Stack>
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
                รายการบริการเสริม
              </Typography>
              <Typography className="text-xs text-slate-500">
                {addons.length} รายการ
              </Typography>
            </Box>

            <Divider className="border-slate-200!" />

            {addons.map((a, idx) => (
              <Box key={a.id} className="hover:bg-slate-50 transition-colors">
                <Box className="p-5">
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
                        <Inventory2RoundedIcon fontSize="small" />
                      </Box>

                      <Box className="min-w-0 flex-1">
                        <Stack
                          direction="row"
                          spacing={1}
                          className="items-center flex-wrap"
                        >
                          <Typography className="text-sm font-extrabold text-slate-900 tracking-wide">
                            {a.id}
                          </Typography>
                          <AddonStatusChip active={a.active} />
                          <Chip
                            size="small"
                            label={formatTHB(a.price)}
                            variant="outlined"
                            sx={{ height: 22, fontSize: 11 }}
                          />
                        </Stack>

                        <Typography className="mt-1 text-lg font-bold text-slate-800">
                          {a.title}
                        </Typography>

                        <Divider className="my-2 border-slate-200!" />

                        <Typography className="text-xs text-slate-500">
                          คิดราคาแบบ:{" "}
                          <span className="font-medium text-slate-700">
                            {pricingLabel(a.pricingType)}
                          </span>
                        </Typography>

                        <Typography className="mt-1 text-xs text-slate-500">
                          ระบบสต็อก:{" "}
                          <span className="font-medium text-slate-700">
                            {a.inventoryTrack
                              ? `ตัดสต็อก • คงเหลือ ${a.stock ?? 0}`
                              : "ไม่ตัดสต็อก"}
                          </span>
                        </Typography>
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
                          สถานะ
                        </Typography>
                        <Typography className="text-sm font-semibold text-slate-900">
                          {a.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
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
                          onClick={() => openDetailDrawer(a)}
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
                          onClick={() => openDetailDrawer(a)}
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
                          จัดการ
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                {idx !== addons.length - 1 && (
                  <Divider className="border-slate-200!" />
                )}
              </Box>
            ))}
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
                    ? "เพิ่มบริการเสริมใหม่"
                    : "แก้ไขบริการเสริม"}
                </Typography>
                <Typography className="text-xs text-slate-500">
                  {drawerMode === "create"
                    ? "กรอกข้อมูลบริการใหม่"
                    : selectedAddon
                    ? `${selectedAddon.id} • ${selectedAddon.title}`
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

          {drawerMode === "create" ||
          (drawerMode === "detail" && selectedAddon) ? (
            <Stack spacing={2}>
              <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <Box
                  className="relative bg-linear-to-br from-slate-900 to-slate-700"
                  sx={{ minHeight: 220 }}
                >
                  <Box className="grid h-55 w-full place-items-center text-slate-300">
                    <Inventory2RoundedIcon sx={{ fontSize: 56 }} />
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
                      {drawerMode === "create" ? "New Addon" : "Addon Overview"}
                    </Typography>
                    <Typography className="mt-2 text-xl font-extrabold">
                      {editTitle || "บริการเสริม"}
                    </Typography>
                    <Typography className="mt-2 text-sm text-slate-200">
                      {pricingLabel(editPricingType)} •{" "}
                      {editInventoryTrack ? "ตัดสต็อก" : "ไม่ตัดสต็อก"}
                    </Typography>
                    <Typography className="mt-4 text-sm text-slate-300">
                      ราคา
                    </Typography>
                    <Typography className="text-2xl font-extrabold">
                      {formatTHB(Number(editPrice) || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SectionCard title="ข้อมูลหลัก">
                  <TextField
                    fullWidth
                    label="ชื่อบริการ"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    sx={roundedFieldSX}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="ราคา"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    sx={roundedFieldSX}
                  />
                </SectionCard>

                <SectionCard title="รูปแบบการคิดราคา">
                  <TextField
                    select
                    fullWidth
                    label="คิดราคาแบบ"
                    value={editPricingType}
                    onChange={(e) =>
                      setEditPricingType(e.target.value as PricingType)
                    }
                    sx={roundedFieldSX}
                  >
                    <MenuItem value="perDay">ต่อวัน</MenuItem>
                    <MenuItem value="perTrip">ต่อครั้ง</MenuItem>
                  </TextField>

                  <InfoRow
                    label="ราคาแสดงผล"
                    value={formatTHB(Number(editPrice) || 0)}
                  />
                </SectionCard>

                <SectionCard title="คลังสินค้า">
                  <Stack
                    direction="row"
                    spacing={1}
                    className="items-center justify-between"
                  >
                    <Typography className="text-sm font-medium text-slate-700">
                      ตัดสต็อก (Inventory Track)
                    </Typography>
                    <Switch
                      checked={editInventoryTrack}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditInventoryTrack(checked);
                        setEditStock(checked ? editStock ?? 0 : null);
                      }}
                      size="small"
                    />
                  </Stack>

                  {editInventoryTrack ? (
                    <TextField
                      fullWidth
                      type="number"
                      label="Stock"
                      value={editStock ?? 0}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      sx={roundedFieldSX}
                    />
                  ) : (
                    <Typography className="text-xs text-slate-500">
                      เมื่อปิดตัดสต็อก ระบบจะไม่เช็คจำนวนคงเหลือสำหรับบริการนี้
                    </Typography>
                  )}
                </SectionCard>

                <SectionCard title="การใช้งาน">
                  <Stack
                    direction="row"
                    spacing={1}
                    className="items-center justify-between"
                  >
                    <Typography className="text-sm font-medium text-slate-700">
                      เปิดใช้งาน
                    </Typography>
                    <Switch
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      size="small"
                    />
                  </Stack>

                  <InfoRow
                    label="สถานะ"
                    value={<AddonStatusChip active={editActive} />}
                  />
                </SectionCard>
              </Box>

              {drawerMode === "detail" && selectedAddon ? (
                <SectionCard title="จัดการรายการ">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => {
                        removeAddon(selectedAddon.id);
                        closeDrawer();
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                      }}
                    >
                      ลบบริการนี้
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
                  onClick={saveAddonForm}
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
                  {drawerMode === "create" ? "เพิ่มบริการ" : "บันทึกข้อมูล"}
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
