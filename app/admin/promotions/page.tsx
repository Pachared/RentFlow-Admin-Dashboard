"use client";

import * as React from "react";
import { Box, Card, CardContent, Typography, Stack, Chip, Divider, Button } from "@mui/material";

type Promo = {
    id: string;
    code: string;
    title: string;
    discount: string;
    expires: string;
    usage: string;
};

const SEED: Promo[] = [
    { id: "P1", code: "NEW10", title: "ส่วนลดลูกค้าใหม่", discount: "ลด 10%", expires: "2026-06-30", usage: "0/100" },
    { id: "P2", code: "WEEKEND200", title: "โปรสุดสัปดาห์", discount: "ลด 200 บาท", expires: "2026-12-31", usage: "12/500" },
];

export default function AdminPromotionsPage() {
    return (
        <Box className="grid gap-4">
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="items-start md:items-center justify-between">
                <Box>
                    <Typography variant="h6" className="text-xl font-extrabold text-slate-900">โปรโมชัน</Typography>
                    <Typography className="text-sm text-slate-600">จัดการคูปอง/โค้ดส่วนลดและโปรโมชัน</Typography>
                </Box>

                <Button
                    variant="contained"
                    size="small"
                    sx={{ textTransform: "none", bgcolor: "rgb(15 23 42)", boxShadow: "none", "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" } }}
                >
                    + สร้างโปรโมชัน
                </Button>
            </Stack>

            <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
                <CardContent className="p-0">
                    {SEED.map((p, idx) => (
                        <Box key={p.id}>
                            <Box className="p-4 sm:p-5">
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2} className="items-start md:items-center justify-between">
                                    <Box>
                                        <Stack direction="row" spacing={1} className="items-center">
                                            <Typography className="text-sm font-bold text-slate-900">{p.title}</Typography>
                                            <Chip size="small" label={p.code} variant="outlined" />
                                        </Stack>
                                        <Typography className="mt-1 text-xs text-slate-500">
                                            ส่วนลด: {p.discount} • หมดอายุ: {p.expires} • ใช้แล้ว: {p.usage}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} className="justify-end w-full md:w-auto">
                                        <Button size="small" variant="outlined" sx={{ textTransform: "none", borderColor: "rgb(226 232 240)" }}>
                                            แก้ไข
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            sx={{ textTransform: "none", bgcolor: "rgb(15 23 42)", boxShadow: "none", "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" } }}
                                        >
                                            ปิดใช้งาน
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                            {idx !== SEED.length - 1 ? <Divider className="border-slate-200!" /> : null}
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Box>
    );
}