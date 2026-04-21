"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { branchesService } from "@/src/services/branches/branches.service";
import type {
  PartnerBranch,
  PartnerBranchPayload,
} from "@/src/services/branches/branches.types";

type BranchType = NonNullable<PartnerBranch["type"]>;
type BranchForm = PartnerBranchPayload;

const emptyForm: BranchForm = {
  name: "",
  address: "",
  phone: "",
  locationId: "",
  type: "storefront",
  displayOrder: 1,
  lat: 0,
  lng: 0,
  openTime: "08:00",
  closeTime: "20:00",
  pickupAvailable: true,
  returnAvailable: true,
  extraFee: 0,
  isActive: true,
};

const branchTypeLabel: Record<BranchType, string> = {
  airport: "สนามบิน",
  storefront: "หน้าร้าน",
  meeting_point: "จุดนัดรับ",
};

function formatTHB(value: number) {
  return `${new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)} บาท`;
}

function googleMapsUrl(branch: PartnerBranch | BranchForm) {
  if (!branch.lat || !branch.lng) return "";
  return `https://maps.google.com/?q=${branch.lat},${branch.lng}`;
}

function buildForm(branch: PartnerBranch): BranchForm {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone || "",
    locationId: branch.locationId || branch.id,
    type: branch.type || "storefront",
    displayOrder: branch.displayOrder || 1,
    lat: branch.lat || 0,
    lng: branch.lng || 0,
    openTime: branch.openTime || "08:00",
    closeTime: branch.closeTime || "20:00",
    pickupAvailable: branch.pickupAvailable,
    returnAvailable: branch.returnAvailable,
    extraFee: branch.extraFee || 0,
    isActive: branch.isActive,
  };
}

function payloadFromBranch(branch: PartnerBranch): BranchForm {
  return buildForm(branch);
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      label={active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
      variant="outlined"
      sx={
        active
          ? {
              borderColor: "rgb(167 243 208)",
              backgroundColor: "rgb(209 250 229)",
              color: "rgb(6 95 70)",
            }
          : {
              borderColor: "rgb(226 232 240)",
              backgroundColor: "rgb(248 250 252)",
              color: "rgb(51 65 85)",
            }
      }
    />
  );
}

export default function AdminLocationsPage() {
  const [branches, setBranches] = React.useState<PartnerBranch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] =
    React.useState<PartnerBranch | null>(null);
  const [form, setForm] = React.useState<BranchForm>(emptyForm);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">(
    "all"
  );
  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const loadBranches = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchesService.getBranches();
      setBranches(response.items);
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลสาขาได้",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const filteredBranches = React.useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return [...branches]
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .filter((branch) => {
        const matchesKeyword =
          !keyword ||
          branch.id.toLowerCase().includes(keyword) ||
          branch.name.toLowerCase().includes(keyword) ||
          branch.address.toLowerCase().includes(keyword);
        const matchesStatus =
          status === "all" ||
          (status === "active" ? branch.isActive : !branch.isActive);
        return matchesKeyword && matchesStatus;
      });
  }, [branches, q, status]);

  function openCreateDrawer() {
    setSelectedBranch(null);
    setForm({
      ...emptyForm,
      displayOrder: branches.length + 1,
    });
    setDrawerOpen(true);
  }

  function openEditDrawer(branch: PartnerBranch) {
    setSelectedBranch(branch);
    setForm(buildForm(branch));
    setDrawerOpen(true);
  }

  function updateForm<K extends keyof BranchForm>(key: K, value: BranchForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveBranch() {
    if (!form.name.trim() || !form.address.trim()) {
      setSnack({
        open: true,
        message: "กรุณากรอกชื่อสาขาและที่อยู่",
        severity: "error",
      });
      return;
    }
    if (!form.pickupAvailable && !form.returnAvailable) {
      setSnack({
        open: true,
        message: "อย่างน้อยต้องเปิดรับรถหรือคืนรถอย่างใดอย่างหนึ่ง",
        severity: "error",
      });
      return;
    }

    try {
      setSaving(true);
      if (selectedBranch) {
        await branchesService.updateBranch(selectedBranch.id, form);
      } else {
        await branchesService.createBranch(form);
      }

      setSnack({
        open: true,
        message: selectedBranch ? "บันทึกสาขาสำเร็จ" : "เพิ่มสาขาสำเร็จ",
        severity: "success",
      });
      setDrawerOpen(false);
      await loadBranches();
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลสาขาได้",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteBranch(branch: PartnerBranch) {
    if (!window.confirm(`ต้องการลบสาขา "${branch.name}" ใช่หรือไม่`)) return;

    try {
      await branchesService.deleteBranch(branch.id);
      setSnack({ open: true, message: "ลบสาขาสำเร็จ", severity: "info" });
      await loadBranches();
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ไม่สามารถลบสาขาได้",
        severity: "error",
      });
    }
  }

  async function moveBranch(branch: PartnerBranch, direction: -1 | 1) {
    const sorted = [...branches].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sorted.findIndex((item) => item.id === branch.id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sorted.length) return;

    const target = sorted[nextIndex];
    const branchPayload = payloadFromBranch(branch);
    const targetPayload = payloadFromBranch(target);
    const branchOrder = branchPayload.displayOrder;
    branchPayload.displayOrder = targetPayload.displayOrder;
    targetPayload.displayOrder = branchOrder;

    try {
      await Promise.all([
        branchesService.updateBranch(branch.id, branchPayload),
        branchesService.updateBranch(target.id, targetPayload),
      ]);
      setSnack({ open: true, message: "อัปเดตลำดับสาขาแล้ว", severity: "success" });
      await loadBranches();
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ไม่สามารถอัปเดตลำดับสาขาได้",
        severity: "error",
      });
    }
  }

  return (
    <Box className="grid gap-4">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="items-start justify-between md:items-center"
      >
        <Box>
          <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
            จุดรับ-ส่ง / สาขา
          </Typography>
          <Typography className="text-sm text-slate-600">
            เพิ่ม แก้ไข ลบ และเปิด/ปิดสาขาที่ลูกค้าเลือกตอนจองรถ
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="w-full md:w-auto">
          <TextField
            size="small"
            label="ค้นหาสาขา"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="w-full sm:w-64"
          />
          <TextField
            size="small"
            select
            label="สถานะ"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | "active" | "inactive")
            }
            className="w-full sm:w-44"
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="active">เปิดใช้งาน</MenuItem>
            <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreateDrawer}
            sx={{ bgcolor: "rgb(15 23 42)", borderRadius: 2.5 }}
          >
            เพิ่มสาขา
          </Button>
        </Stack>
      </Stack>

      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
        <CardContent className="p-0!">
          {loading ? (
            <Box className="grid min-h-72 place-items-center">
              <CircularProgress />
            </Box>
          ) : filteredBranches.length === 0 ? (
            <Box className="grid min-h-72 place-items-center p-8 text-center">
              <Stack spacing={1} className="items-center">
                <PlaceRoundedIcon className="text-slate-400" sx={{ fontSize: 48 }} />
                <Typography className="font-bold text-slate-900">ยังไม่มีสาขา</Typography>
                <Typography className="max-w-md text-sm text-slate-500">
                  เพิ่มจุดรับ-ส่งเพื่อให้ลูกค้าเลือกสถานที่รับรถและคืนรถ
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box>
              {filteredBranches.map((branch, index) => (
                <Box key={branch.id}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    className="items-start justify-between p-4 md:p-5"
                  >
                    <Stack direction="row" spacing={2} className="min-w-0 flex-1">
                      <Box className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                        <PlaceRoundedIcon />
                      </Box>
                      <Box className="min-w-0 flex-1">
                        <Stack direction="row" spacing={1} className="flex-wrap items-center">
                          <Typography className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {branch.id}
                          </Typography>
                          <StatusChip active={branch.isActive} />
                          <Chip
                            label={branchTypeLabel[branch.type || "storefront"]}
                            variant="outlined"
                          />
                        </Stack>
                        <Typography className="mt-2 text-lg font-black text-slate-950">
                          {branch.name}
                        </Typography>
                        <Typography className="mt-1 text-sm text-slate-600">
                          {branch.address}
                        </Typography>
                        <Typography className="mt-1 text-sm text-slate-500">
                          เวลา {branch.openTime || "-"} - {branch.closeTime || "-"} • ค่าบริการเพิ่ม {formatTHB(branch.extraFee || 0)}
                        </Typography>
                        <Typography className="mt-1 text-xs text-slate-400">
                          รับรถ: {branch.pickupAvailable ? "เปิด" : "ปิด"} • คืนรถ: {branch.returnAvailable ? "เปิด" : "ปิด"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "row", md: "column" }} spacing={1} className="w-full md:w-auto">
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => moveBranch(branch, -1)}>
                          ขึ้น
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => moveBranch(branch, 1)}>
                          ลง
                        </Button>
                      </Stack>
                      {googleMapsUrl(branch) ? (
                        <Button
                          variant="outlined"
                          href={googleMapsUrl(branch)}
                          target="_blank"
                          startIcon={<OpenInNewRoundedIcon />}
                          className="flex-1 md:flex-none"
                        >
                          แผนที่
                        </Button>
                      ) : null}
                      <Button variant="outlined" onClick={() => openEditDrawer(branch)} className="flex-1 md:flex-none">
                        แก้ไข
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={() => deleteBranch(branch)}
                        className="flex-1 md:flex-none"
                      >
                        ลบ
                      </Button>
                    </Stack>
                  </Stack>
                  {index < filteredBranches.length - 1 ? <Divider /> : null}
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box className="flex h-full w-screen max-w-xl flex-col bg-slate-50">
          <Stack direction="row" className="items-center justify-between border-b border-slate-200 bg-white p-4">
            <Box>
              <Typography className="text-lg font-black text-slate-950">
                {selectedBranch ? "แก้ไขสาขา" : "เพิ่มสาขา"}
              </Typography>
              <Typography className="text-sm text-slate-500">
                ข้อมูลสาขาจะใช้ในหน้าจองของลูกค้า
              </Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box className="flex-1 overflow-auto p-4">
            <Stack spacing={2}>
              <TextField label="ชื่อสาขา" value={form.name} onChange={(e) => updateForm("name", e.target.value)} fullWidth />
              <TextField label="ที่อยู่" value={form.address} onChange={(e) => updateForm("address", e.target.value)} fullWidth multiline minRows={2} />
              <TextField label="เบอร์โทร" value={form.phone || ""} onChange={(e) => updateForm("phone", e.target.value)} fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="ประเภทสาขา" value={form.type} onChange={(e) => updateForm("type", e.target.value as BranchType)} fullWidth>
                  <MenuItem value="storefront">หน้าร้าน</MenuItem>
                  <MenuItem value="airport">สนามบิน</MenuItem>
                  <MenuItem value="meeting_point">จุดนัดรับ</MenuItem>
                </TextField>
                <TextField label="ลำดับแสดง" type="number" value={form.displayOrder} onChange={(e) => updateForm("displayOrder", Number(e.target.value))} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="ละติจูด" type="number" value={form.lat || 0} onChange={(e) => updateForm("lat", Number(e.target.value))} fullWidth />
                <TextField label="ลองจิจูด" type="number" value={form.lng || 0} onChange={(e) => updateForm("lng", Number(e.target.value))} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="เวลาเปิด" type="time" value={form.openTime || "08:00"} onChange={(e) => updateForm("openTime", e.target.value)} fullWidth />
                <TextField label="เวลาปิด" type="time" value={form.closeTime || "20:00"} onChange={(e) => updateForm("closeTime", e.target.value)} fullWidth />
              </Stack>
              <TextField label="ค่าบริการเพิ่ม" type="number" value={form.extraFee} onChange={(e) => updateForm("extraFee", Number(e.target.value))} fullWidth />
              <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
                <CardContent>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={<Switch checked={form.isActive} onChange={(e) => updateForm("isActive", e.target.checked)} />}
                      label="เปิดใช้งานสาขานี้"
                    />
                    <FormControlLabel
                      control={<Switch checked={form.pickupAvailable} onChange={(e) => updateForm("pickupAvailable", e.target.checked)} />}
                      label="ลูกค้าเลือกรับรถที่สาขานี้ได้"
                    />
                    <FormControlLabel
                      control={<Switch checked={form.returnAvailable} onChange={(e) => updateForm("returnAvailable", e.target.checked)} />}
                      label="ลูกค้าเลือกคืนรถที่สาขานี้ได้"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} className="border-t border-slate-200 bg-white p-4">
            <Button fullWidth variant="outlined" onClick={() => setDrawerOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveRoundedIcon />}
              disabled={saving}
              onClick={saveBranch}
              sx={{ bgcolor: "rgb(15 23 42)" }}
            >
              บันทึก
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
