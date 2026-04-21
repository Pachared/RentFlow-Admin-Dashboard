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
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { authService } from "@/src/services/auth/auth.service";
import { RentFlowApiError } from "@/src/services/core/api-client.service";
import { tenantService } from "@/src/services/tenant/tenant.service";
import { writeStoreProfile } from "@/src/lib/partner-store";

const pillFieldSX = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "white",

        "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: "12px",
            borderColor: "rgb(226 232 240)",
        },

        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgb(203 213 225)",
        },

        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgb(15 23 42)",
        },

        "& .MuiOutlinedInput-input": {
            padding: "14px 16px",
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
            const next = params.get("next") || "/admin/dashboard";
            const safeNext = next.startsWith("/admin") ? next : "/admin/dashboard";

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
                    createdAt: tenant.createdAt,
                    updatedAt: tenant.updatedAt,
                });
                router.replace(safeNext);
            } catch (tenantError) {
                if (
                    tenantError instanceof RentFlowApiError &&
                    tenantError.status === 404
                ) {
                    router.replace("/admin/store-setup");
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
        <Box className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Box className="w-full max-w-md">
                {/* Brand / Header */}
                <Stack className="mb-6 items-center text-center">
                    <Box className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <DirectionsCarRoundedIcon />
                    </Box>
                </Stack>

                <Card
                    elevation={0}
                    className="w-full rounded-2xl! border border-slate-200 bg-white"
                    sx={{ boxShadow: "none" }}
                >
                    {/* ให้ scroll เฉพาะใน Card ถ้าเนื้อหาเกินความสูงของสี่เหลี่ยม */}
                    <CardContent className="p-4! overflow-auto">
                        <Stack spacing={1} className="mb-4 items-center text-center">
                            <Typography variant="h5" className="text-xl font-bold text-slate-900">
                                เข้าสู่ระบบแอดมิน RentFlow
                            </Typography>
                        </Stack>

                        <Divider className="mt-5! mb-10! border-slate-200!" />

                        {error ? (
                            <Alert
                                severity="error"
                                className="mb-4 rounded-xl!"
                                onClose={() => setError(null)}
                            >
                                {error}
                            </Alert>
                        ) : null}

                        <Box component="form" onSubmit={handleSubmit} className="mt-3 grid gap-4">
                            <TextField
                                label="ชื่อผู้ใช้"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                fullWidth
                                sx={pillFieldSX}
                                autoComplete="username"
                                error={!usernameOk}
                                helperText={!usernameOk ? "ชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร" : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="รหัสผ่าน"
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                sx={pillFieldSX}
                                autoComplete="current-password"
                                error={!pwOk}
                                helperText={!pwOk ? "อย่างน้อย 6 ตัวอักษร" : " "}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() => setShowPw((v) => !v)}
                                                aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                            >
                                                {showPw ? (
                                                    <VisibilityOffRoundedIcon fontSize="small" />
                                                ) : (
                                                    <VisibilityRoundedIcon fontSize="small" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!canSubmit}
                                className="rounded-xl! py-3! font-semibold!"
                                sx={{
                                    textTransform: "none",
                                    bgcolor: "rgb(15 23 42)",
                                    boxShadow: "none",
                                    "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
                                }}
                            >
                                {loading ? (
                                    <Stack direction="row" className="items-center gap-2">
                                        <CircularProgress size={18} />
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
