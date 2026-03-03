"use client";

import { Box, Card, CardContent, Typography, Stack, Button, Divider } from "@mui/material";

export default function AdminReportsPage() {
    return (
        <Box className="grid gap-4">
            <Box>
                <Typography variant="h6" className="text-xl font-extrabold text-slate-900">รายงาน</Typography>
                <Typography className="text-sm text-slate-600">สรุปและส่งออกข้อมูลเพื่อวิเคราะห์</Typography>
            </Box>

            <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
                <CardContent className="p-5">
                    <Typography className="text-sm font-bold text-slate-900">Export</Typography>
                    <Typography className="mt-1 text-xs text-slate-500">
                        ส่งออกข้อมูลเป็น CSV/Excel เพื่อนำไปทำรายงานต่อ
                    </Typography>

                    <Divider className="my-4! border-slate-200!" />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Button variant="outlined" sx={{ textTransform: "none", borderColor: "rgb(226 232 240)" }}>
                            ส่งออกการจอง (CSV)
                        </Button>
                        <Button variant="outlined" sx={{ textTransform: "none", borderColor: "rgb(226 232 240)" }}>
                            ส่งออกการชำระเงิน (CSV)
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ textTransform: "none", bgcolor: "rgb(15 23 42)", boxShadow: "none", "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" } }}
                        >
                            ดาวน์โหลดรายงานสรุป
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}