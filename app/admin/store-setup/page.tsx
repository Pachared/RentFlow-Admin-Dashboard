"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import DomainRoundedIcon from "@mui/icons-material/DomainRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
    RENTFLOW_ROOT_DOMAIN,
    buildStorefrontDomain,
    normalizeDomainSlug,
    readStoreProfile,
    validateDomainSlug,
    writeStoreProfile,
} from "@/src/lib/partner-store";
import { RentFlowApiError } from "@/src/services/core/api-client.service";
import { tenantService } from "@/src/services/tenant/tenant.service";

export default function StoreSetupPage() {
    const router = useRouter();
    const [shopName, setShopName] = React.useState("");
    const [domainSlug, setDomainSlug] = React.useState("");
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState(
        "กรุณากรอกชื่อร้านและชื่อโดเมนให้ถูกต้อง"
    );
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        const profile = readStoreProfile();
        if (profile) {
            setShopName(profile.shopName);
            setDomainSlug(profile.domainSlug);
        }

        tenantService
            .getMyTenant()
            .then((tenant) => {
                if (!active) return;
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
                setShopName(tenant.shopName);
                setDomainSlug(tenant.domainSlug);
            })
            .catch((error: unknown) => {
                if (
                    error instanceof RentFlowApiError &&
                    error.status === 404
                ) {
                    return;
                }
                if (!active) return;
                setSnackbarMessage(
                    error instanceof Error
                        ? error.message
                        : "ไม่สามารถดึงข้อมูลร้านได้"
                );
                setSnackbarOpen(true);
            });

        return () => {
            active = false;
        };
    }, []);

    const normalizedSlug = normalizeDomainSlug(domainSlug);
    const domainError = domainSlug ? validateDomainSlug(normalizedSlug) : "";
    const shopError =
        shopName.trim().length > 0 && shopName.trim().length < 2
            ? "ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร"
            : "";
    const storefrontDomain = normalizedSlug
        ? buildStorefrontDomain(normalizedSlug)
        : `ชื่อร้าน.${RENTFLOW_ROOT_DOMAIN}`;
    const canSubmit =
        shopName.trim().length >= 2 &&
        normalizedSlug.length > 0 &&
        !domainError &&
        !saving;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!canSubmit) {
            setSnackbarMessage("กรุณากรอกชื่อร้านและชื่อโดเมนให้ถูกต้อง");
            setSnackbarOpen(true);
            return;
        }

        try {
            setSaving(true);
            const tenant = await tenantService.saveMyTenant({
                shopName,
                domainSlug: normalizedSlug,
            });
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

            const params = new URLSearchParams(window.location.search);
            const next = params.get("next") || "/admin/dashboard";
            router.replace(next.startsWith("/admin") ? next : "/admin/dashboard");
        } catch (error: unknown) {
            setSnackbarMessage(
                error instanceof Error
                    ? error.message
                    : "ไม่สามารถบันทึกข้อมูลร้านได้"
            );
            setSnackbarOpen(true);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box className="mx-auto max-w-6xl">
            <Box className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <Card
                    elevation={0}
                    className="rounded-3xl! border border-slate-200 bg-slate-950 text-white"
                    sx={{ boxShadow: "none" }}
                >
                    <CardContent className="p-6! md:p-8!">
                        <Chip
                            label="Partner onboarding"
                            className="bg-white/10! text-white!"
                        />
                        <Typography className="mt-6 text-3xl font-black tracking-tight md:text-5xl">
                            ตั้งค่าร้านของคุณก่อนเริ่มใช้งาน
                        </Typography>
                        <Typography className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                            เจ้าของร้านทุกเจ้าจะใช้หลังบ้านรวมที่ partner.rentflow.com
                            แต่หน้าร้านสาธารณะจะแยกเป็น subdomain ของร้าน เช่น
                            shop1.rentflow.com เพื่อให้ลูกค้าจำง่ายและแยกข้อมูลตามร้าน
                        </Typography>

                        <Divider className="my-6! border-white/15!" />

                        <Stack spacing={2}>
                            {[
                                "ตั้งชื่อร้านสำหรับแสดงในหลังบ้านและหน้าร้าน",
                                "ตั้งชื่อโดเมนย่อยที่ไม่ซ้ำกับระบบ",
                                "หลังบันทึก ระบบจะพาไปหน้าแดชบอร์ดของร้าน",
                            ].map((item) => (
                                <Stack key={item} direction="row" spacing={1.5}>
                                    <CheckCircleRoundedIcon className="text-emerald-300" />
                                    <Typography className="text-sm text-slate-200">
                                        {item}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={0}
                    className="rounded-3xl! border border-slate-200 bg-white"
                    sx={{ boxShadow: "none" }}
                >
                    <CardContent className="p-6! md:p-8!">
                        <Box>
                            <Typography className="text-sm font-bold uppercase tracking-[0.22em] text-slate-400">
                                Store identity
                            </Typography>
                            <Typography className="mt-2 text-2xl font-black text-slate-950">
                                ชื่อร้านและ Domain
                            </Typography>
                            <Typography className="mt-2 text-sm leading-6 text-slate-500">
                                ตัวอย่าง URL คือ {"{shop}.rentflow.com"} โดยค่า shop
                                จะมาจากชื่อโดเมนที่เจ้าของร้านตั้งในหน้านี้
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            className="mt-6 grid gap-5"
                        >
                            <TextField
                                label="ชื่อร้าน"
                                value={shopName}
                                onChange={(event) => setShopName(event.target.value)}
                                fullWidth
                                error={!!shopError}
                                helperText={shopError || "เช่น Fulltank Premium Rental"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <StorefrontRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="ชื่อ Domain ของร้าน"
                                value={domainSlug}
                                onChange={(event) =>
                                    setDomainSlug(normalizeDomainSlug(event.target.value))
                                }
                                fullWidth
                                error={!!domainError}
                                helperText={
                                    domainError ||
                                    "ใช้ภาษาอังกฤษ ตัวเลข และขีดกลางเท่านั้น เช่น fulltank-garage"
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DomainRoundedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Typography className="text-sm font-semibold text-slate-500">
                                                .{RENTFLOW_ROOT_DOMAIN}
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <Typography className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Preview URL
                                </Typography>
                                <Typography className="mt-2 break-all text-2xl font-black text-slate-950">
                                    https://{storefrontDomain}
                                </Typography>
                                <Typography className="mt-2 text-sm leading-6 text-slate-500">
                                    ลูกค้าจะเข้าเว็บเช่ารถของร้านคุณผ่าน URL นี้ ส่วนคุณจัดการร้านที่
                                    partner.rentflow.com เหมือนเดิม
                                </Typography>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                disabled={!canSubmit}
                                endIcon={<ArrowForwardRoundedIcon />}
                                className="rounded-2xl! py-3! font-bold!"
                                sx={{
                                    bgcolor: "rgb(15 23 42)",
                                    "&:hover": { bgcolor: "rgb(2 6 23)" },
                                }}
                            >
                                {saving ? (
                                    <Stack direction="row" className="items-center gap-2">
                                        <CircularProgress size={18} />
                                        <span>กำลังบันทึก...</span>
                                    </Stack>
                                ) : (
                                    "บันทึกและเข้าสู่แดชบอร์ด"
                                )}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3500}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity="warning"
                    onClose={() => setSnackbarOpen(false)}
                    className="rounded-xl!"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
