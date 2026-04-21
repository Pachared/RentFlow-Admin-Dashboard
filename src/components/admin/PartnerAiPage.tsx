"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { aiService } from "@/src/services/ai/ai.service";
import type {
  PartnerAiAction,
  PartnerAiAlert,
  PartnerAiAssistant,
  PartnerAiMetric,
} from "@/src/services/ai/ai.types";

function toneBg(tone: PartnerAiMetric["tone"] | PartnerAiAlert["tone"]) {
  if (tone === "success") return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (tone === "warning") return "bg-amber-50 text-amber-900 border-amber-200";
  if (tone === "danger") return "bg-rose-50 text-rose-900 border-rose-200";
  if (tone === "info") return "bg-sky-50 text-sky-900 border-sky-200";
  return "bg-slate-50 text-slate-900 border-slate-200";
}

function priorityLabel(priority: PartnerAiAction["priority"]) {
  if (priority === "high") return "เร่งทำ";
  if (priority === "medium") return "ควรวางแผน";
  return "ติดตาม";
}

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

export default function PartnerAiPage() {
  const [assistant, setAssistant] = React.useState<PartnerAiAssistant | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await aiService.getAssistant();
        if (active) setAssistant(data);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูล AI ได้");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box className="grid min-h-[50vh] place-items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box className="rounded-4xl border border-slate-200 bg-white p-6 md:p-8">
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={3}
          justifyContent="space-between"
        >
          <Box className="max-w-3xl">
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label={assistant?.provider || "database-rules"}
              className="border border-violet-200! bg-violet-50! text-violet-900!"
            />
            <Typography className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              AI Assistant สำหรับเจ้าของร้าน
            </Typography>
            <Typography className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              หน้านี้สรุปภาพรวมร้านจากข้อมูลจริงในระบบ เพื่อช่วยให้รู้ว่าควรจัดการ booking,
              payment, รีวิว หรือรถคันไหนก่อนในแต่ละวัน
            </Typography>
          </Box>

          <Box className="min-w-72 rounded-3xl bg-slate-950 p-5 text-white">
            <Typography className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Generated at
            </Typography>
            <Typography className="mt-3 text-lg font-black">
              {formatDate(assistant?.generatedAt)}
            </Typography>
            <Typography className="mt-3 text-sm leading-6 text-slate-300">
              สรุปนี้ใช้ข้อมูล booking, payment, review และรถจากร้านของคุณเท่านั้น
            </Typography>
          </Box>
        </Stack>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {assistant ? (
        <>
          <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
            <CardContent className="p-6!">
              <Stack direction="row" spacing={2} className="items-start">
                <Box className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <InsightsRoundedIcon />
                </Box>
                <Box>
                  <Typography className="text-lg font-black text-slate-950">
                    สรุปจาก AI
                  </Typography>
                  <Typography className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
                    {assistant.summary}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {assistant.metrics.map((metric) => (
              <Card key={metric.label} elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
                <CardContent className="p-5!">
                  <Typography className="text-sm text-slate-500">{metric.label}</Typography>
                  <Typography className="mt-2 text-3xl font-black text-slate-950">
                    {metric.displayValue}
                  </Typography>
                  <Typography className="mt-2 text-xs leading-6 text-slate-500">
                    {metric.detail}
                  </Typography>
                  <Box className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneBg(metric.tone)}`}>
                    {metric.tone === "success"
                      ? "ภาพรวมดี"
                      : metric.tone === "warning"
                        ? "ควรติดตาม"
                        : metric.tone === "info"
                          ? "มี insight"
                          : metric.tone === "danger"
                            ? "ต้องระวัง"
                            : "สรุปสถานะ"}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
              <CardContent className="p-5!">
                <Stack direction="row" spacing={2} className="items-center">
                  <Box className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                    <WarningAmberRoundedIcon />
                  </Box>
                  <Box>
                    <Typography className="text-lg font-black text-slate-950">สิ่งที่ควรจับตา</Typography>
                    <Typography className="text-sm text-slate-500">AI คัดประเด็นที่ควรดูจากข้อมูลร้านล่าสุด</Typography>
                  </Box>
                </Stack>
                <Stack spacing={2} className="mt-5">
                  {assistant.alerts.map((alert) => (
                    <Box key={`${alert.title}-${alert.detail}`} className={`rounded-3xl border px-4 py-4 ${toneBg(alert.tone)}`}>
                      <Typography className="font-black">{alert.title}</Typography>
                      <Typography className="mt-1 text-sm leading-6">{alert.detail}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
              <CardContent className="p-5!">
                <Stack direction="row" spacing={2} className="items-center">
                  <Box className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                    <AutoAwesomeRoundedIcon />
                  </Box>
                  <Box>
                    <Typography className="text-lg font-black text-slate-950">สิ่งที่ AI แนะนำให้ทำต่อ</Typography>
                    <Typography className="text-sm text-slate-500">ลำดับงานที่ช่วยให้ร้านเดินได้ไวขึ้นจากข้อมูลจริง</Typography>
                  </Box>
                </Stack>
                <Stack spacing={2} className="mt-5">
                  {assistant.actions.map((action) => (
                    <Box key={`${action.title}-${action.detail}`} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography className="font-black text-slate-950">{action.title}</Typography>
                        <Chip size="small" label={priorityLabel(action.priority)} className="bg-slate-900! text-white!" />
                      </Stack>
                      <Typography className="mt-2 text-sm leading-6 text-slate-600">{action.detail}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
            <CardContent className="p-5!">
              <Stack direction="row" spacing={2} className="items-center">
                <Box className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <DirectionsCarRoundedIcon />
                </Box>
                <Box>
                  <Typography className="text-lg font-black text-slate-950">รถที่กำลังทำผลงานดี</Typography>
                  <Typography className="text-sm text-slate-500">AI สรุปจากจำนวน booking และยอดรวมของรถแต่ละคัน</Typography>
                </Box>
              </Stack>

              <Divider className="my-5! border-slate-200!" />

              <Stack spacing={2}>
                {assistant.topCars.length === 0 ? (
                  <Box className="grid min-h-48 place-items-center text-center">
                    <Typography className="text-sm text-slate-500">ยังไม่มีข้อมูล booking มากพอสำหรับจัดอันดับรถ</Typography>
                  </Box>
                ) : (
                  assistant.topCars.map((item) => (
                    <Box key={item.carId} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography className="font-black text-slate-950">{item.carName || item.carId}</Typography>
                          {item.isHighlighted ? <Chip size="small" label="ตัวเด่น" className="bg-emerald-50! text-emerald-700!" /> : null}
                        </Stack>
                        <Typography className="mt-1 text-sm text-slate-500">
                          ถูกจอง {item.bookings} ครั้ง • รายได้รวม {formatTHB(item.revenue)}
                        </Typography>
                      </Box>
                      <Typography className="text-sm font-bold text-slate-900">Top performer</Typography>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </>
      ) : null}
    </Stack>
  );
}
