"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";

type Status = "pending" | "approved" | "rejected";

type Row = {
  id: string;
  bookingId: string;
  customer: string;
  amount: number;
  status: Status;
};

function formatTHB(n: number) {
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n) + " บาท";
}

function statusLabel(s: Status) {
  if (s === "approved") return "อนุมัติแล้ว";
  if (s === "rejected") return "ไม่ผ่าน";
  return "รอตรวจ";
}

function statusChipSX(s: Status) {
  if (s === "approved") {
    return {
      border: "1px solid rgb(167 243 208)",
      bgcolor: "rgb(209 250 229)",
      color: "rgb(6 95 70)",
    };
  }
  if (s === "rejected") {
    return {
      border: "1px solid rgb(254 202 202)",
      bgcolor: "rgb(254 226 226)",
      color: "rgb(153 27 27)",
    };
  }
  return {
    border: "1px solid rgb(253 230 138)",
    bgcolor: "rgb(254 243 199)",
    color: "rgb(146 64 14)",
  };
}

export default function PaymentVerificationPage() {
  const [rows, setRows] = React.useState<Row[]>([
    {
      id: "1",
      bookingId: "BK-1004",
      customer: "Pachara",
      amount: 1590,
      status: "pending",
    },
  ]);

  function updateStatus(id: string, status: Status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const kpi = React.useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const approved = rows.filter((r) => r.status === "approved").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  return (
    <Box className="grid gap-4">
      {/* Header (เหมือน Support) */}
      <Box>
        <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
          ตรวจสลิป / ยืนยันชำระ
        </Typography>
        <Typography className="text-sm text-slate-600">
          ตรวจสอบรายการโอน/แนบสลิป และอัปเดตสถานะให้การจอง
        </Typography>
      </Box>

      {/* Summary Card (เหมือน Support) */}
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
        <CardContent className="p-5">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            className="items-start sm:items-center justify-between"
          >
            <Stack direction="row" spacing={1.25} className="items-center">
              <Box className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
                <FactCheckRoundedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography className="text-sm font-bold text-slate-900">
                  ทั้งหมด {kpi.total} • รอตรวจ {kpi.pending} • ผ่าน {kpi.approved} • ไม่ผ่าน {kpi.rejected}
                </Typography>
                <Typography className="mt-1 text-xs text-slate-500">
                  แนะนำ: ตรวจยอด/ชื่อผู้โอน/เวลาโอน แล้วค่อยกด “อนุมัติ”
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={kpi.pending > 0 ? `PENDING ${kpi.pending}` : "ALL CLEAR"}
              variant="outlined"
              sx={{
                border: "1px solid rgb(226 232 240)",
                bgcolor: "rgb(248 250 252)",
                color: "rgb(51 65 85)",
                fontWeight: 900,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* List */}
      <Card elevation={0} className="rounded-2xl! border border-slate-200 bg-white">
        <CardContent className="p-0">
          <Box className="px-5 py-4 flex items-center justify-between">
            <Typography className="text-sm font-bold text-slate-900">
              รายการรอตรวจ
            </Typography>
            <Typography className="text-xs text-slate-500">
              {rows.length} รายการ
            </Typography>
          </Box>

          <Divider className="border-slate-200!" />

          <Box className="divide-y divide-slate-200">
            {rows.map((r) => (
              <Box key={r.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  className="items-start md:items-center justify-between"
                >
                  {/* Left */}
                  <Box className="min-w-0">
                    <Stack direction="row" spacing={1} className="items-center flex-wrap">
                      <Typography className="text-sm font-black text-slate-900">
                        {r.bookingId}
                      </Typography>

                      <Chip
                        size="small"
                        icon={
                          r.status === "approved" ? (
                            <CheckCircleRoundedIcon fontSize="small" />
                          ) : r.status === "rejected" ? (
                            <CancelRoundedIcon fontSize="small" />
                          ) : (
                            <HourglassTopRoundedIcon fontSize="small" />
                          )
                        }
                        label={statusLabel(r.status)}
                        variant="outlined"
                        sx={{
                          ...statusChipSX(r.status),
                          height: 22,
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      />

                      <Chip
                        size="small"
                        label={formatTHB(r.amount)}
                        variant="outlined"
                        sx={{ height: 22, fontSize: 11 }}
                      />
                    </Stack>

                    <Typography className="mt-1 text-sm text-slate-700">
                      ลูกค้า: {r.customer}
                    </Typography>

                    <Typography className="mt-1 text-xs text-slate-500">
                      * ต่อ API ได้: รูปสลิป/เลขอ้างอิง/เวลาชำระ/บัญชีรับโอน
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} className="items-center flex-wrap">
                    {r.status === "pending" ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleRoundedIcon />}
                          onClick={() => updateStatus(r.id, "approved")}
                          sx={{
                            textTransform: "none",
                            bgcolor: "rgb(15 23 42)",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "rgb(2 6 23)", boxShadow: "none" },
                            borderRadius: 2,
                          }}
                        >
                          อนุมัติ
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CancelRoundedIcon />}
                          onClick={() => updateStatus(r.id, "rejected")}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: "rgb(226 232 240)",
                          }}
                        >
                          ไม่ผ่าน
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateStatus(r.id, "pending")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          borderColor: "rgb(226 232 240)",
                        }}
                      >
                        ย้อนกลับเป็น “รอตรวจ”
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            ))}

            {rows.length === 0 ? (
              <Box className="px-5 py-10 text-center">
                <Typography className="text-sm font-semibold text-slate-900">
                  ไม่มีรายการรอตรวจ
                </Typography>
                <Typography className="mt-1 text-xs text-slate-500">
                  เมื่อมีลูกค้าแนบสลิป ระบบจะเพิ่มรายการในหน้านี้อัตโนมัติ
                </Typography>
              </Box>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}