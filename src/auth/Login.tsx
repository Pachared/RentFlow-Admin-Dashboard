"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { authService } from "@/src/services/auth/auth.service";
import { RentFlowApiError } from "@/src/services/core/api-client.service";
import { tenantService } from "@/src/services/tenant/tenant.service";
import { writeStoreProfile } from "@/src/lib/partner-store";

const fieldSX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "22px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.22)",
    },
    "& .MuiOutlinedInput-input": {
      padding: "16px 18px",
      fontWeight: 600,
    },
  },
  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px white inset",
    WebkitTextFillColor: "inherit",
    caretColor: "inherit",
    transition: "background-color 9999s ease-out 0s",
  },
};

export default function Login() {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const usernameOk = username.length === 0 ? true : username.trim().length >= 3;
  const pwOk = password.length === 0 ? true : password.length >= 6;
  const canSubmit = username.trim().length >= 3 && password.length >= 6 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ถูกต้อง");
      return;
    }

    try {
      setLoading(true);

      await authService.login({
        username: username.trim(),
        password,
      });

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/partner/dashboard";
      const safeNext = next.startsWith("/partner") ? next : "/partner/dashboard";

      try {
        const tenant = await tenantService.getMyTenant();
        writeStoreProfile({
          tenantId: tenant.id,
          shopName: tenant.shopName,
          domainSlug: tenant.domainSlug,
          storefrontDomain: tenant.publicDomain,
          ownerEmail: tenant.ownerEmail,
          status: tenant.status,
          plan: tenant.plan,
          logoUrl: tenant.logoUrl,
          promoImageUrl: tenant.promoImageUrl,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        });
        router.replace(safeNext);
      } catch (tenantError) {
        if (
          tenantError instanceof RentFlowApiError &&
          tenantError.status === 404
        ) {
          router.replace("/partner/store-setup");
          return;
        }
        throw tenantError;
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box className="min-h-screen bg-[var(--rf-partner-bg)] px-4 py-8 md:px-6">
      <Box className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card elevation={0} className="partner-card order-2 rounded-[34px]! lg:order-1">
          <CardContent className="p-6! md:p-8!">
            <Box className="partner-page-header">
              <Box className="partner-page-kicker">สำหรับเจ้าของร้าน</Box>
              <Typography className="partner-page-title">
                จัดการร้าน รถ และการจอง
                <br />
                ในที่เดียว
              </Typography>
              <Typography className="partner-page-subtitle">
                หลังบ้านนี้ออกแบบสำหรับเจ้าของร้านโดยตรง ให้ดูข้อมูลร้าน ปรับหน้าร้าน
                จัดการรถ ตรวจการจอง และติดตามการชำระเงินได้จากหน้าจอเดียว
              </Typography>
            </Box>

            <Divider className="my-6! border-white/70!" />

            <Stack spacing={2.25}>
              {[
                "ตั้งค่าร้านและโดเมนของคุณได้จากระบบเดียว",
                "จัดการรถ สาขา การจอง และบัญชีไลน์ของร้านในหน้าเดียวกัน",
                "หน้าหลังบ้านอ่านง่ายและรองรับเดสก์ท็อป แมคบุ๊ก ไอแพด และมือถือ",
              ].map((item) => (
                <Box key={item} className="partner-card-soft rounded-[24px] px-4 py-4">
                  <Typography className="text-sm font-semibold leading-7 text-slate-700">
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} className="partner-card order-1 rounded-[34px]! lg:order-2">
          <CardContent className="p-6! md:p-8!">
            <Box className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-[22px] bg-[var(--rf-partner-blue-deep)] text-base font-black tracking-[-0.05em] text-white shadow-[0_20px_44px_rgba(15,23,42,0.24)]">
              RF
            </Box>

            <Stack spacing={1} className="items-center text-center">
              <Typography className="partner-section-title">
                เข้าสู่ระบบศูนย์จัดการร้าน
              </Typography>
              <Typography className="partner-section-subtitle">
                ใช้ชื่อผู้ใช้และรหัสผ่านของร้านเพื่อเข้าสู่หน้าจัดการ
              </Typography>
            </Stack>

            <Divider className="mt-6! mb-7! border-white/70!" />

            {error ? (
              <Alert
                severity="error"
                className="mb-4 rounded-[22px]!"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            ) : null}

            <Box component="form" onSubmit={handleSubmit} className="grid gap-4">
              <TextField
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                sx={fieldSX}
                autoComplete="username"
                error={!usernameOk}
                helperText={!usernameOk ? "ชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร" : " "}
              />

              <TextField
                label="รหัสผ่าน"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                sx={fieldSX}
                autoComplete="current-password"
                error={!pwOk}
                helperText={!pwOk ? "อย่างน้อย 6 ตัวอักษร" : " "}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        onClick={() => setShowPw((v) => !v)}
                        className="min-h-0! px-0! py-0! text-sm! font-semibold! text-slate-500!"
                        sx={{
                          minWidth: 0,
                          backgroundColor: "transparent !important",
                          "&:hover": {
                            backgroundColor: "transparent !important",
                          },
                        }}
                      >
                        {showPw ? "ซ่อน" : "แสดง"}
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                className="mt-1 rounded-full! py-3.5! font-semibold!"
              >
                {loading ? (
                  <Stack direction="row" className="items-center gap-2">
                    <CircularProgress size={18} color="inherit" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </Stack>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
