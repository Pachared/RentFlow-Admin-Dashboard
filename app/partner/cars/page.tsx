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
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { branchesService } from "@/src/services/branches/branches.service";
import type { PartnerBranch } from "@/src/services/branches/branches.types";
import { carsService } from "@/src/services/cars/cars.service";
import type {
  PartnerCar,
  PartnerCarAvailabilityStatus,
  PartnerCarPayload,
  PartnerCarStatus,
} from "@/src/services/cars/cars.types";
import { usePartnerRealtimeRefresh } from "@/src/hooks/realtime/usePartnerRealtimeRefresh";

type CarForm = PartnerCarPayload;

const emptyForm: CarForm = {
  name: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  type: "Sedan",
  seats: 5,
  transmission: "Auto",
  fuel: "Gasoline",
  pricePerDay: 0,
  unitCount: 1,
  description: "",
  locationId: "",
  status: "available",
};

const statusMeta: Record<
  PartnerCarAvailabilityStatus,
  { label: string; className: string }
> = {
  available: {
    label: "พร้อมให้เช่า",
    className: "partner-chip partner-chip-green",
  },
  rented: {
    label: "ถูกเช่าอยู่",
    className: "partner-chip partner-chip-orange",
  },
  maintenance: {
    label: "ซ่อมบำรุง",
    className: "partner-chip partner-chip-rose",
  },
  hidden: {
    label: "ซ่อน",
    className: "partner-chip",
  },
  booked: {
    label: "ถูกจองแล้ว",
    className: "partner-chip partner-chip-orange",
  },
};

const carTypeLabel: Record<string, string> = {
  Economy: "ประหยัด",
  Sedan: "ซีดาน",
  SUV: "เอสยูวี",
  Van: "รถตู้",
};

const transmissionLabel: Record<string, string> = {
  Auto: "อัตโนมัติ",
  Manual: "ธรรมดา",
};

const fuelLabel: Record<string, string> = {
  Gasoline: "เบนซิน",
  Hybrid: "ไฮบริด",
  EV: "ไฟฟ้า",
  Diesel: "ดีเซล",
};

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

function buildFormFromCar(car: PartnerCar): CarForm {
  return {
    name: car.name,
    brand: car.brand,
    model: car.model,
    year: car.year,
    type: car.type,
    seats: car.seats,
    transmission: car.transmission,
    fuel: car.fuel,
    pricePerDay: car.pricePerDay,
    unitCount: Math.max(car.unitCount || 1, 1),
    description: car.description || "",
    locationId: car.locationId || "",
    status: car.status || "available",
  };
}

function imageIdFromUrl(value: string) {
  try {
    const parsed = new URL(value);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    const parts = value.split("?")[0].split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }
}

function StatusChip({ status }: { status: PartnerCarAvailabilityStatus }) {
  const meta = statusMeta[status] || statusMeta.available;
  return <Chip label={meta.label} className={meta.className} />;
}

export default function PartnerCarsPage() {
  const [cars, setCars] = React.useState<PartnerCar[]>([]);
  const [branches, setBranches] = React.useState<PartnerBranch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCar, setSelectedCar] = React.useState<PartnerCar | null>(null);
  const [form, setForm] = React.useState<CarForm>(emptyForm);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<PartnerCarAvailabilityStatus | "all">("all");
  const [snack, setSnack] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [carsResponse, branchesResponse] = await Promise.all([
        carsService.getCars(),
        branchesService.getBranches(),
      ]);
      setCars(carsResponse.items);
      setBranches(branchesResponse.items);
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลรถได้",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  usePartnerRealtimeRefresh({
    events: [
      "booking.created",
      "booking.updated",
      "booking.cancelled",
      "car.changed",
      "availability.changed",
      "branch.changed",
    ],
    onRefresh: loadData,
  });

  const filteredCars = React.useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return cars.filter((car) => {
      const matchesKeyword =
        !keyword ||
        car.id.toLowerCase().includes(keyword) ||
        car.name.toLowerCase().includes(keyword) ||
        car.brand.toLowerCase().includes(keyword) ||
        car.model.toLowerCase().includes(keyword);
      const displayStatus = car.availabilityStatus || car.status;
      const matchesStatus = status === "all" || displayStatus === status;
      return matchesKeyword && matchesStatus;
    });
  }, [cars, q, status]);

  function openCreateDrawer() {
    setSelectedCar(null);
    setForm(emptyForm);
    setImageFiles([]);
    setDrawerOpen(true);
  }

  function openEditDrawer(car: PartnerCar) {
    setSelectedCar(car);
    setForm(buildFormFromCar(car));
    setImageFiles([]);
    setDrawerOpen(true);
  }

  function updateForm<K extends keyof CarForm>(key: K, value: CarForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveCar() {
    if (!form.name.trim() || !form.brand.trim() || !form.model.trim()) {
      setSnack({
        open: true,
        message: "กรุณากรอกชื่อรถ ยี่ห้อ และรุ่นรถ",
        severity: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const savedCar = selectedCar
        ? await carsService.updateCar(selectedCar.id, form)
        : await carsService.createCar(form);

      if (imageFiles.length > 0) {
        await carsService.uploadCarImages(savedCar.id, imageFiles, {
          replace: true,
        });
      }

      setSnack({
        open: true,
        message: selectedCar ? "บันทึกข้อมูลรถสำเร็จ" : "เพิ่มรถสำเร็จ",
        severity: "success",
      });
      setDrawerOpen(false);
      await loadData();
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลรถได้",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCar(car: PartnerCar) {
    if (!window.confirm(`ต้องการลบรถ "${car.name}" ใช่หรือไม่`)) return;

    try {
      await carsService.deleteCar(car.id);
      setSnack({ open: true, message: "ลบรถสำเร็จ", severity: "info" });
      await loadData();
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ไม่สามารถลบรถได้",
        severity: "error",
      });
    }
  }

  async function deleteCarImage(imageUrl: string) {
    if (!selectedCar) return;
    const imageId = imageIdFromUrl(imageUrl);
    if (!imageId) {
      setSnack({
        open: true,
        message: "ไม่พบรหัสรูปภาพที่ต้องการลบ",
        severity: "error",
      });
      return;
    }
    if (!window.confirm("ต้องการลบรูปนี้ใช่หรือไม่")) return;

    try {
      await carsService.deleteCarImage(selectedCar.id, imageId);
      setSnack({ open: true, message: "ลบรูปภาพสำเร็จ", severity: "info" });
      const response = await carsService.getCars();
      setCars(response.items);
      const freshCar =
        response.items.find((item) => item.id === selectedCar.id) || null;
      setSelectedCar(freshCar);
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถลบรูปภาพได้",
        severity: "error",
      });
    }
  }

  async function moveCarImage(imageUrl: string, direction: -1 | 1) {
    if (!selectedCar?.images?.length) return;
    const currentIndex = selectedCar.images.indexOf(imageUrl);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedCar.images.length) {
      return;
    }
    const nextImages = [...selectedCar.images];
    const [moved] = nextImages.splice(currentIndex, 1);
    nextImages.splice(nextIndex, 0, moved);
    const imageIds = nextImages.map(imageIdFromUrl).filter(Boolean);

    try {
      await carsService.reorderCarImages(selectedCar.id, imageIds);
      setSelectedCar({ ...selectedCar, images: nextImages, imageUrl: nextImages[0], image: nextImages[0] });
      setCars((prev) =>
        prev.map((car) =>
          car.id === selectedCar.id
            ? { ...car, images: nextImages, imageUrl: nextImages[0], image: nextImages[0] }
            : car
        )
      );
      setSnack({ open: true, message: "อัปเดตลำดับรูปภาพแล้ว", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message:
          error instanceof Error ? error.message : "ไม่สามารถอัปเดตลำดับรูปภาพได้",
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
          <Typography variant="h6" className="partner-section-title text-slate-900">
            รถของร้าน
          </Typography>
          <Typography className="partner-section-subtitle">
            เพิ่ม แก้ไข ลบรถ และจัดการรูปภาพที่แสดงบนหน้าร้าน
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className="w-full md:w-auto">
          <TextField
            size="small"
            label="ค้นหารถ"
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
              setStatus(event.target.value as PartnerCarAvailabilityStatus | "all")
            }
            className="w-full sm:w-44"
          >
            <MenuItem value="all">ทั้งหมด</MenuItem>
            <MenuItem value="available">พร้อมให้เช่า</MenuItem>
            <MenuItem value="booked">ถูกจองแล้ว</MenuItem>
            <MenuItem value="rented">ถูกเช่าอยู่</MenuItem>
            <MenuItem value="maintenance">ซ่อมบำรุง</MenuItem>
            <MenuItem value="hidden">ซ่อน</MenuItem>
          </TextField>
          <Button
            variant="contained"
            onClick={openCreateDrawer}
            sx={{ bgcolor: "rgb(15 23 42)", borderRadius: 2.5 }}
          >
            เพิ่มรถ
          </Button>
        </Stack>
      </Stack>

      <Card elevation={0} className="partner-card rounded-[30px]!">
        <CardContent className="p-0!">
          {loading ? (
            <Box className="grid min-h-72 place-items-center">
              <CircularProgress />
            </Box>
          ) : filteredCars.length === 0 ? (
            <Box className="partner-empty">
              <Box>
                <Typography className="font-bold text-slate-900">ยังไม่มีรถ</Typography>
                <Typography className="mt-1 max-w-md text-sm text-slate-500">
                  เพิ่มรถคันแรกเพื่อให้ลูกค้าเห็นบนหน้าร้านของคุณ
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              {filteredCars.map((car, index) => (
                <Box key={car.id}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    className="items-start justify-between p-4 md:p-5"
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className="min-w-0 flex-1">
                      <Box className="grid h-40 w-full shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:w-56">
                        {car.imageUrl ? (
                          <Box
                            component="img"
                            src={car.imageUrl}
                            alt={car.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Typography className="text-sm font-bold text-slate-400">
                            ไม่มีรูป
                          </Typography>
                        )}
                      </Box>
                      <Box className="min-w-0 flex-1">
                        <Stack direction="row" spacing={1} className="flex-wrap items-center">
                          <Typography className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            {car.id}
                          </Typography>
                          <StatusChip status={car.availabilityStatus || car.status} />
                        </Stack>
                        <Typography className="mt-2 text-lg font-black text-slate-950">
                          {car.name}
                        </Typography>
                        <Typography className="mt-1 text-sm text-slate-600">
                          {car.brand} {car.model} • {car.year} • {carTypeLabel[car.type] || car.type}
                        </Typography>
                        <Typography className="mt-1 text-sm text-slate-600">
                          {car.seats} ที่นั่ง • {transmissionLabel[car.transmission] || car.transmission} • {fuelLabel[car.fuel] || car.fuel}
                        </Typography>
                        <Typography className="mt-1 text-sm text-slate-600">
                          รถทั้งหมด {Math.max(car.unitCount || 1, 1)} คัน
                          {typeof car.availableUnits === "number"
                            ? ` • พร้อมให้เช่า ${Math.max(car.availableUnits, 0)} คัน`
                            : ""}
                        </Typography>
                        <Typography className="mt-3 text-xl font-black text-slate-950">
                          {formatTHB(car.pricePerDay)} / วัน
                        </Typography>
                        <Typography className="mt-1 text-xs text-slate-400">
                          อัปเดตล่าสุด {formatDate(car.updatedAt)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction={{ xs: "row", md: "column" }} spacing={1} className="w-full md:w-auto">
                      <Button variant="outlined" onClick={() => openEditDrawer(car)} className="flex-1 md:flex-none">
                        แก้ไข
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteCar(car)}
                        className="flex-1 md:flex-none"
                      >
                        ลบ
                      </Button>
                    </Stack>
                  </Stack>
                  {index < filteredCars.length - 1 ? <Divider /> : null}
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
                {selectedCar ? "แก้ไขรถ" : "เพิ่มรถ"}
              </Typography>
              <Typography className="text-sm text-slate-500">
                ข้อมูลนี้จะแสดงบนหน้าร้านของคุณทันที
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
              ปิด
            </Button>
          </Stack>

          <Box className="flex-1 overflow-auto p-4">
            <Stack spacing={2}>
              <TextField label="ชื่อรถ" value={form.name} onChange={(e) => updateForm("name", e.target.value)} fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="ยี่ห้อ" value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} fullWidth />
                <TextField label="รุ่น" value={form.model} onChange={(e) => updateForm("model", e.target.value)} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="ปี" type="number" value={form.year} onChange={(e) => updateForm("year", Number(e.target.value))} fullWidth />
                <TextField label="ราคา/วัน" type="number" value={form.pricePerDay} onChange={(e) => updateForm("pricePerDay", Number(e.target.value))} fullWidth />
                <TextField label="จำนวนรถรุ่นนี้" type="number" value={form.unitCount} onChange={(e) => updateForm("unitCount", Math.max(Number(e.target.value), 1))} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="ประเภทรถ" value={form.type} onChange={(e) => updateForm("type", e.target.value)} fullWidth>
                  <MenuItem value="Economy">ประหยัด</MenuItem>
                  <MenuItem value="Sedan">ซีดาน</MenuItem>
                  <MenuItem value="SUV">เอสยูวี</MenuItem>
                  <MenuItem value="Van">รถตู้</MenuItem>
                </TextField>
                <TextField label="จำนวนที่นั่ง" type="number" value={form.seats} onChange={(e) => updateForm("seats", Number(e.target.value))} fullWidth />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="เกียร์" value={form.transmission} onChange={(e) => updateForm("transmission", e.target.value)} fullWidth>
                  <MenuItem value="Auto">อัตโนมัติ</MenuItem>
                  <MenuItem value="Manual">ธรรมดา</MenuItem>
                </TextField>
                <TextField select label="เชื้อเพลิง" value={form.fuel} onChange={(e) => updateForm("fuel", e.target.value)} fullWidth>
                  <MenuItem value="Gasoline">เบนซิน</MenuItem>
                  <MenuItem value="Hybrid">ไฮบริด</MenuItem>
                  <MenuItem value="EV">ไฟฟ้า</MenuItem>
                  <MenuItem value="Diesel">ดีเซล</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select label="สาขาหลัก" value={form.locationId || ""} onChange={(e) => updateForm("locationId", e.target.value)} fullWidth>
                  <MenuItem value="">ไม่ระบุ</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.locationId || branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="สถานะ" value={form.status} onChange={(e) => updateForm("status", e.target.value as PartnerCarStatus)} fullWidth>
                  <MenuItem value="available">พร้อมให้เช่า</MenuItem>
                  <MenuItem value="rented">ถูกเช่าอยู่</MenuItem>
                  <MenuItem value="maintenance">ซ่อมบำรุง</MenuItem>
                  <MenuItem value="hidden">ซ่อน</MenuItem>
                </TextField>
              </Stack>
              <TextField
                label="รายละเอียด"
                value={form.description || ""}
                onChange={(e) => updateForm("description", e.target.value)}
                minRows={3}
                multiline
                fullWidth
              />

              <Card elevation={0} className="partner-card rounded-[28px]!">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography className="font-bold text-slate-900">
                      รูปภาพรถ
                    </Typography>
                    {selectedCar?.imageUrl ? (
                      <Box component="img" src={selectedCar.imageUrl} alt={selectedCar.name} className="h-44 w-full rounded-2xl object-cover" />
                    ) : null}
                    {selectedCar?.images?.length ? (
                      <Box className="grid grid-cols-2 gap-2">
                        {selectedCar.images.map((imageUrl, index) => (
                          <Box key={imageUrl} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            <Box component="img" src={imageUrl} alt={selectedCar.name} className="h-24 w-full object-cover" />
                            <Stack direction="row">
                              <Button
                                fullWidth
                                size="small"
                                disabled={index === 0}
                                onClick={() => moveCarImage(imageUrl, -1)}
                              >
                                ขึ้น
                              </Button>
                              <Button
                                fullWidth
                                size="small"
                                disabled={index === selectedCar.images!.length - 1}
                                onClick={() => moveCarImage(imageUrl, 1)}
                              >
                                ลง
                              </Button>
                            </Stack>
                            <Button
                              fullWidth
                              color="error"
                              size="small"
                              onClick={() => deleteCarImage(imageUrl)}
                            >
                              ลบรูปนี้
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    ) : null}
                    <Button variant="outlined" component="label">
                      เลือกรูปเพื่ออัปโหลด/แทนที่
                      <input
                        hidden
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        multiple
                        onChange={(event) =>
                          setImageFiles(Array.from(event.target.files || []))
                        }
                      />
                    </Button>
                    <Typography className="text-xs text-slate-500">
                      {imageFiles.length
                        ? `เลือกแล้ว ${imageFiles.length} รูป ระบบจะแทนที่รูปเดิมหลังบันทึก`
                        : "รองรับไฟล์รูปภาพทั่วไป"}
                    </Typography>
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
              disabled={saving}
              onClick={saveCar}
              sx={{ bgcolor: "rgb(15 23 42)" }}
            >
              {saving ? <CircularProgress size={18} color="inherit" /> : "บันทึก"}
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
