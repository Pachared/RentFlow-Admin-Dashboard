"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

type TabKey = "general" | "security";

export default function AdminProfileSettingsPage() {
  const searchParams = useSearchParams();

  const [tab, setTab] = React.useState<TabKey>(() => {
    const t = searchParams.get("tab");
    return t === "security" ? "security" : "general";
  });

  const router = useRouter();

  React.useEffect(() => {
    const t = searchParams.get("tab");
    setTab(t === "security" ? "security" : "general");
  }, [searchParams]);

  const [profile, setProfile] = React.useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    phone: "",
  });

  const [pwd, setPwd] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  function onPickAvatar() {
    fileRef.current?.click();
  }

  function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const isImg = f.type.startsWith("image/");
    const maxMB = 3;

    if (!isImg) {
      setErrMsg("ไฟล์ต้องเป็นรูปภาพเท่านั้น");
      return;
    }
    if (f.size > maxMB * 1024 * 1024) {
      setErrMsg(`ขนาดรูปต้องไม่เกิน ${maxMB}MB`);
      return;
    }

    setErrMsg(null);
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }

  async function onSaveGeneral() {
    setSaving(true);
    setOkMsg(null);
    setErrMsg(null);
    try {
      // TODO: PATCH /admin/profile
      await new Promise((r) => setTimeout(r, 500));
      setOkMsg("บันทึกข้อมูลโปรไฟล์เรียบร้อย");
    } catch {
      setErrMsg("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    setSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      if (!pwd.current || !pwd.next || !pwd.confirm) {
        setErrMsg("กรุณากรอกข้อมูลให้ครบ");
        return;
      }
      if (pwd.next.length < 8) {
        setErrMsg("รหัสผ่านใหม่ต้องอย่างน้อย 8 ตัวอักษร");
        return;
      }
      if (pwd.next !== pwd.confirm) {
        setErrMsg("ยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
        return;
      }

      // TODO: POST /admin/change-password
      await new Promise((r) => setTimeout(r, 500));

      setPwd({ current: "", next: "", confirm: "" });
      setOkMsg("เปลี่ยนรหัสผ่านเรียบร้อย");
    } catch {
      setErrMsg("เปลี่ยนรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    (profile.firstName?.[0] || "").toUpperCase() +
    (profile.lastName?.[0] || "").toUpperCase();

  const onReset = () => {
    setProfile({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phone: "",
    });
    setPwd({ current: "", next: "", confirm: "" });
    setAvatarUrl(null);
    setOkMsg(null);
    setErrMsg(null);
  };

  return (
    <Box className="grid gap-4">
      {/* Header (เหมือน Support page) */}
      <Box>
        <Typography
          variant="h6"
          className="text-xl font-extrabold text-slate-900"
        >
          ตั้งค่าโปรไฟล์
        </Typography>
        <Typography className="text-sm text-slate-600">
          จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีผู้ใช้
        </Typography>
      </Box>

      {/* Alerts */}
      {okMsg && (
        <Alert severity="success" onClose={() => setOkMsg(null)}>
          {okMsg}
        </Alert>
      )}
      {errMsg && (
        <Alert severity="error" onClose={() => setErrMsg(null)}>
          {errMsg}
        </Alert>
      )}

      <Card
        elevation={0}
        className="rounded-2xl! border border-slate-200 bg-white"
      >
        <CardContent className="p-5">
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="items-start sm:items-center justify-between"
            >
              <Stack direction="row" spacing={1.25} className="items-center">
                <Box className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                  <PersonRoundedIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    การตั้งค่า
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    แก้ไขข้อมูลทั่วไป และตั้งค่าความปลอดภัย
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Divider />

            <Tabs
              value={tab}
              onChange={(_, v: TabKey) => {
                setTab(v);
                router.replace(`/admin/settings?tab=${v}`);
              }}
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                minHeight: 40,
                p: 0.5,

                "& .MuiTab-root": {
                  minHeight: 36,
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: "10px",
                  px: 2,
                  color: "rgb(71 85 105)",
                },

                "& .Mui-selected": {
                  bgcolor: "#fff",
                  color: "rgb(15 23 42)",
                  border: "1px solid rgb(226 232 240)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Tab value="general" label="ข้อมูลทั่วไป" />
              <Tab value="security" label="ความปลอดภัย" />
            </Tabs>

            <Divider />

            {/* Content */}
            {tab === "general" ? (
              <Stack spacing={2.5}>
                {/* Avatar row */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  className="items-start sm:items-center justify-between"
                >
                  <Stack direction="row" spacing={2} className="items-center">
                    <Avatar
                      src={avatarUrl || undefined}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "rgb(15 23 42)",
                        fontWeight: 900,
                      }}
                    >
                      {initials || "A"}
                    </Avatar>

                    <Box>
                      <Typography className="text-sm font-bold text-slate-900">
                        รูปโปรไฟล์
                      </Typography>
                      <Typography className="mt-1 text-xs text-slate-500">
                        รองรับไฟล์รูปภาพ ขนาดไม่เกิน 3MB
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onAvatarFileChange}
                    />
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<PhotoCameraRoundedIcon />}
                      onClick={onPickAvatar}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "rgb(226 232 240)",
                        color: "rgb(15 23 42)",
                        "&:hover": {
                          borderColor: "rgb(203 213 225)",
                          bgcolor: "white",
                        },
                      }}
                    >
                      อัปโหลดรูป
                    </Button>
                  </Box>
                </Stack>

                <Divider />

                {/* Form */}
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      label="ชื่อ"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, firstName: e.target.value }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="นามสกุล"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, lastName: e.target.value }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      label="อีเมล"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, email: e.target.value }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="เบอร์โทร"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, phone: e.target.value }))
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                        },
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1.5} className="items-center">
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<SaveRoundedIcon />}
                      disabled={saving}
                      onClick={onSaveGeneral}
                      sx={{
                        textTransform: "none",
                        bgcolor: "rgb(15 23 42)",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "rgb(2 6 23)",
                          boxShadow: "none",
                        },
                        borderRadius: 2,
                      }}
                    >
                      บันทึก
                    </Button>

                    <Button
                      variant="outlined"
                      size="medium"
                      disabled={saving}
                      onClick={onReset}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "rgb(226 232 240)",
                        color: "rgb(15 23 42)",
                        "&:hover": {
                          borderColor: "rgb(203 213 225)",
                          bgcolor: "white",
                        },
                      }}
                    >
                      ยกเลิก
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
                <Stack direction="row" spacing={1.25} className="items-center">
                  <Box className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                    <LockRoundedIcon fontSize="medium" />
                  </Box>
                  <Box>
                    <Typography className="text-sm font-bold text-slate-900">
                      เปลี่ยนรหัสผ่าน
                    </Typography>
                    <Typography className="mt-1 text-xs text-slate-500">
                      แนะนำให้ใช้รหัสผ่านที่เดายาก
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <TextField
                    type="password"
                    label="รหัสผ่านปัจจุบัน"
                    value={pwd.current}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, current: e.target.value }))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                      },
                    }}
                    fullWidth
                  />
                  <TextField
                    type="password"
                    label="รหัสผ่านใหม่"
                    value={pwd.next}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, next: e.target.value }))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                      },
                    }}
                    fullWidth
                    helperText="อย่างน้อย 8 ตัวอักษร"
                  />
                  <TextField
                    type="password"
                    label="ยืนยันรหัสผ่านใหม่"
                    value={pwd.confirm}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, confirm: e.target.value }))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                      },
                    }}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<SaveRoundedIcon />}
                    disabled={saving}
                    onClick={onChangePassword}
                    sx={{
                      textTransform: "none",
                      bgcolor: "rgb(15 23 42)",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
                      borderRadius: 2,
                      width: "fit-content",
                    }}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
