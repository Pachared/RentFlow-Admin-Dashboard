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
  Collapse,
  Divider,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { lineService } from "@/src/services/line/line.service";
import type { PartnerLineConnection } from "@/src/services/line/line.types";

type Snack = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      className="items-start justify-between lg:items-center"
    >
      <Box>
        <Typography variant="h6" className="partner-section-title">
          {title}
        </Typography>
        <Typography className="partner-section-subtitle">{description}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

function PageSnack({
  snack,
  onClose,
}: {
  snack: Snack;
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={snack.severity} onClose={onClose} variant="filled">
        {snack.message}
      </Alert>
    </Snackbar>
  );
}

function useSnack() {
  const [snack, setSnack] = React.useState<Snack>({
    open: false,
    message: "",
    severity: "success",
  });
  const close = React.useCallback(
    () => setSnack((prev) => ({ ...prev, open: false })),
    []
  );
  return { snack, setSnack, close };
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function connectionLabel(status?: string) {
  switch (status) {
    case "connected":
      return "เชื่อมสำเร็จ";
    case "draft":
      return "บันทึกแล้ว";
    case "live":
      return "รับข้อความจริงแล้ว";
    case "success":
      return "ผ่านแล้ว";
    case "failed":
      return "ไม่ผ่าน";
    case "pending":
      return "รอตรวจสอบ";
    default:
      return "ยังไม่เชื่อม";
  }
}

function connectionChipClass(status?: string) {
  if (["connected", "live", "success"].includes(status || "")) {
    return "partner-chip partner-chip-green";
  }
  if (["failed"].includes(status || "")) {
    return "partner-chip partner-chip-rose";
  }
  if (["pending", "draft"].includes(status || "")) {
    return "partner-chip partner-chip-orange";
  }
  return "partner-chip";
}

export function PartnerLineMessagingPage() {
  const [connection, setConnection] = React.useState<PartnerLineConnection | null>(null);
  const [preview, setPreview] = React.useState<PartnerLineConnection | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testingWebhook, setTestingWebhook] = React.useState(false);
  const [guideOpen, setGuideOpen] = React.useState(true);
  const [form, setForm] = React.useState({
    channelId: "",
    channelSecret: "",
    accessToken: "",
  });
  const { snack, setSnack, close } = useSnack();

  const current = preview ?? connection;
  const hasUnsavedInput = React.useMemo(() => {
    return Boolean(
      form.channelSecret.trim() ||
        form.accessToken.trim() ||
        (form.channelId.trim() &&
          form.channelId.trim() !== (connection?.channelId || ""))
    );
  }, [connection?.channelId, form.accessToken, form.channelId, form.channelSecret]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await lineService.getLineMessaging();
      setConnection(data);
      setPreview(null);
      setForm({
        channelId: data.channelId || "",
        channelSecret: "",
        accessToken: "",
      });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "โหลดข้อมูลบัญชีไลน์ไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [setSnack]);

  React.useEffect(() => {
    load();
  }, [load]);

  const webhookUrl = current?.webhookUrl || "";
  const previewMode = Boolean(preview);

  function credentialsPayload() {
    return {
      channelId: form.channelId.trim() || undefined,
      channelSecret: form.channelSecret.trim() || undefined,
      accessToken: form.accessToken.trim() || undefined,
    };
  }

  async function copyWebhookUrl() {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setSnack({ open: true, message: "คัดลอกลิงก์รับข้อความแล้ว", severity: "success" });
    } catch {
      setSnack({ open: true, message: "คัดลอกลิงก์รับข้อความไม่สำเร็จ", severity: "error" });
    }
  }

  async function saveConnection() {
    if (!form.channelId.trim() || !form.channelSecret.trim() || !form.accessToken.trim()) {
      setSnack({
        open: true,
        message: "กรุณากรอกรหัสช่องทาง รหัสลับช่องทาง และโทเคนเข้าถึงให้ครบ",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const saved = await lineService.saveLineMessaging({
        channelId: form.channelId.trim(),
        channelSecret: form.channelSecret.trim(),
        accessToken: form.accessToken.trim(),
      });
      setConnection(saved);
      setPreview(null);
      setForm({
        channelId: saved.channelId || form.channelId.trim(),
        channelSecret: "",
        accessToken: "",
      });
      setSnack({ open: true, message: "บันทึกบัญชีไลน์สำเร็จ", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "บันทึกบัญชีไลน์ไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function verifyConnection() {
    setTesting(true);
    try {
      const result = await lineService.testLineMessaging(credentialsPayload());
      if (hasUnsavedInput) {
        setPreview(result.connection);
      } else {
        setConnection(result.connection);
        setPreview(null);
      }
      setSnack({ open: true, message: "ตรวจสอบการเชื่อมต่อผ่านแล้ว", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ตรวจสอบการเชื่อมต่อไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setTesting(false);
    }
  }

  async function verifyWebhook() {
    setTestingWebhook(true);
    try {
      const result = await lineService.testLineWebhook({
        ...credentialsPayload(),
        endpoint: webhookUrl || undefined,
      });
      if (hasUnsavedInput) {
        setPreview(result.connection);
      } else {
        setConnection(result.connection);
        setPreview(null);
      }
      setSnack({
        open: true,
        message: result.webhookTest.success
          ? "ทดสอบลิงก์รับข้อความผ่านแล้ว"
          : result.webhookTest.reason || "ลิงก์รับข้อความยังไม่ผ่าน",
        severity: result.webhookTest.success ? "success" : "info",
      });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ทดสอบลิงก์รับข้อความไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setTestingWebhook(false);
    }
  }

  async function disconnectLine() {
    if (!window.confirm("ต้องการลบการเชื่อมต่อบัญชีไลน์ของร้านนี้ใช่หรือไม่")) {
      return;
    }
    try {
      await lineService.deleteLineMessaging();
      await load();
      setSnack({ open: true, message: "ลบการเชื่อมต่อบัญชีไลน์แล้ว", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ลบการเชื่อมต่อบัญชีไลน์ไม่สำเร็จ",
        severity: "error",
      });
    }
  }

  if (loading) {
    return (
      <Card elevation={0} className="partner-card rounded-[30px]!">
        <CardContent className="grid min-h-[420px] place-items-center">
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className="grid gap-4">
      <SectionHeader
        title="เชื่อมบัญชีไลน์ของร้าน"
        description="ร้านแต่ละเจ้าจะใช้บัญชีไลน์ของตัวเอง ลูกค้าเห็นชื่อร้านจริง และข้อความแยกกันอัตโนมัติ"
        action={
          <Button
            variant="outlined"
            onClick={() => setGuideOpen((prev) => !prev)}
            sx={{ textTransform: "none" }}
          >
            {guideOpen ? "ซ่อนคู่มือ" : "เปิดคู่มือ"}
          </Button>
        }
      />

      <Card
        elevation={0}
        className="partner-card overflow-hidden rounded-[30px]!"
        sx={{
          background:
            "linear-gradient(135deg, rgba(236,253,245,1) 0%, rgba(240,253,250,1) 45%, rgba(255,255,255,1) 100%)",
        }}
      >
        {(saving || testing || testingWebhook) && <LinearProgress />}
        <CardContent className="p-6!">
          <Stack direction={{ xs: "column", lg: "row" }} spacing={3} className="justify-between">
            <Stack direction="row" spacing={2} className="items-start">
              <Box
                className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl text-base font-black text-white shadow-[0_18px_45px_rgba(5,150,105,0.25)]"
                sx={{
                  bgcolor: "#047857",
                  backgroundImage: current?.pictureUrl
                    ? `linear-gradient(rgba(4,120,87,0.18), rgba(4,120,87,0.18)), url(${current.pictureUrl})`
                    : undefined,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                {current?.pictureUrl ? "" : "ไลน์"}
              </Box>
              <Box>
                <Stack direction="row" spacing={1} className="items-center">
                  <Typography className="text-lg font-black text-slate-950">
                    {current?.displayName || current?.shopName || "บัญชีไลน์ของร้าน"}
                  </Typography>
                  <Chip
                    label={connectionLabel(current?.status)}
                    size="small"
                    className={connectionChipClass(current?.status)}
                  />
                  {previewMode ? (
                    <Chip
                      label="ยังไม่ได้บันทึก"
                      size="small"
                      className="partner-chip partner-chip-orange"
                    />
                  ) : null}
                </Stack>
                <Typography className="mt-1 text-sm text-slate-600">
                  {current?.basicId
                    ? `รหัสบัญชีไลน์: ${current.basicId}`
                    : "เชื่อมร้านนี้กับบัญชีไลน์ของตัวเองได้จากหน้านี้"}
                </Typography>
                <Typography className="mt-2 text-sm text-slate-500">
                  ตรวจสอบล่าสุด: {formatDate(current?.lastVerifiedAt)}
                </Typography>
                {current?.lastWebhookTestStatus ? (
                  <Typography className="text-sm text-slate-500">
                    สถานะลิงก์รับข้อความ: {connectionLabel(current.lastWebhookTestStatus)}
                    {current.lastWebhookTestAt
                      ? ` • ${formatDate(current.lastWebhookTestAt)}`
                      : ""}
                  </Typography>
                ) : null}
              </Box>
            </Stack>

            <Stack spacing={1.25} className="w-full lg:max-w-xs">
              <Button
                variant="contained"
                onClick={verifyConnection}
                disabled={testing}
                sx={{ textTransform: "none", bgcolor: "#047857" }}
              >
                ตรวจสอบการเชื่อมต่อ
              </Button>
              <Button
                variant="outlined"
                onClick={verifyWebhook}
                disabled={testingWebhook}
                sx={{ textTransform: "none" }}
              >
                ทดสอบลิงก์รับข้อความ
              </Button>
            </Stack>
          </Stack>

          {current?.lastError ? (
            <Alert severity="warning" className="mt-4">
              {current.lastError}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Collapse in={guideOpen}>
        <Box className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "ขั้นตอนที่ 1 สร้างบัญชีไลน์ของร้าน",
              description: "สร้างบัญชีไลน์ของร้าน แล้วเลือกชื่อร้านจริงที่ลูกค้าจะเห็นในแชท",
              href: "https://manager.line.biz/",
              button: "ไปหน้าจัดการไลน์",
            },
            {
              title: "ขั้นตอนที่ 2 เปิดระบบรับส่งข้อความ",
              description: "เข้าเครื่องมือผู้พัฒนาไลน์ แล้วเปิดระบบรับส่งข้อความของร้าน เพื่อให้ระบบรับข้อความจากลูกค้าได้",
              href: "https://developers.line.biz/console/",
              button: "เปิดเครื่องมือผู้พัฒนาไลน์",
            },
            {
              title: "ขั้นตอนที่ 3 วางค่าลงในระบบ",
              description: "คัดลอกรหัสช่องทาง รหัสลับช่องทาง และโทเคนเข้าถึงมาใส่ด้านล่าง แล้วกดตรวจสอบการเชื่อมต่อ",
              href: "https://developers.line.biz/en/docs/messaging-api/getting-started/",
              button: "เปิดคู่มือของไลน์",
            },
          ].map((step) => (
            <Card
              key={step.title}
              elevation={0}
              className="partner-card rounded-[30px]!"
            >
              <CardContent className="h-full p-5!">
                <Stack spacing={2} className="h-full">
                  <Box
                    className="grid h-12 w-12 place-items-center rounded-2xl"
                    sx={{ bgcolor: "rgba(15,23,42,0.06)", color: "rgb(15 23 42)" }}
                  >
                    <Typography className="font-black text-slate-950">
                      {step.title.match(/\d/)?.[0]}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography className="font-black text-slate-950">{step.title}</Typography>
                    <Typography className="mt-1 text-sm leading-6 text-slate-600">
                      {step.description}
                    </Typography>
                  </Box>
                  <Box className="mt-auto">
                    <Button
                      component="a"
                      href={step.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                    >
                      {step.button}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Collapse>

      <Box className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-6!">
            <Stack spacing={3}>
              <Box>
                <Typography className="text-lg font-black text-slate-950">
                  ข้อมูลสำหรับเชื่อมต่อ
                </Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  ใส่ค่าจากเครื่องมือผู้พัฒนาไลน์ให้ครบ แล้วค่อยกดตรวจสอบการเชื่อมต่อ
                </Typography>
              </Box>

              <TextField
                label="รหัสช่องทาง"
                value={form.channelId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, channelId: event.target.value }))
                }
                fullWidth
                placeholder="เช่น 2001234567"
                helperText={
                  connection?.channelId && !form.channelId
                    ? `ระบบมีค่าเดิม: ${connection.channelId}`
                    : "คัดลอกจากหน้าตั้งค่าพื้นฐานของช่องทางไลน์"
                }
              />

              <TextField
                label="รหัสลับช่องทาง"
                type="password"
                value={form.channelSecret}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, channelSecret: event.target.value }))
                }
                fullWidth
                placeholder="ใส่รหัสลับช่องทาง"
                helperText={
                  connection?.hasChannelSecret
                    ? "ถ้าไม่เปลี่ยนค่าเดิม สามารถเว้นว่างไว้ตอนกดทดสอบได้"
                    : "คัดลอกจากหน้าตั้งค่าพื้นฐานของช่องทางไลน์"
                }
              />

              <TextField
                label="โทเคนเข้าถึง"
                type="password"
                value={form.accessToken}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, accessToken: event.target.value }))
                }
                fullWidth
                placeholder="ใส่โทเคนเข้าถึง"
                helperText={
                  connection?.hasAccessToken
                    ? "ถ้าไม่เปลี่ยนค่าเดิม สามารถเว้นว่างไว้ตอนกดทดสอบได้"
                    : "ใช้โทเคนเข้าถึงของช่องทางไลน์"
                }
              />

              <Divider />

              <Box>
                <Typography className="font-black text-slate-950">ลิงก์รับข้อความ</Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  นำลิงก์นี้ไปวางในเครื่องมือผู้พัฒนาไลน์ แล้วเปิดการใช้งานรับข้อความ จากนั้นค่อยกดทดสอบ
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField value={webhookUrl} fullWidth InputProps={{ readOnly: true }} />
                <Button
                  variant="outlined"
                  onClick={copyWebhookUrl}
                  sx={{ textTransform: "none", minWidth: 128 }}
                >
                  คัดลอก
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                <Button
                  variant="contained"
                  onClick={saveConnection}
                  disabled={saving}
                  sx={{ textTransform: "none", bgcolor: "rgb(15 23 42)" }}
                >
                  บันทึกค่าเชื่อมต่อ
                </Button>
                <Button
                  variant="outlined"
                  onClick={verifyConnection}
                  disabled={testing}
                  sx={{ textTransform: "none" }}
                >
                  ตรวจสอบการเชื่อมต่อ
                </Button>
                <Button
                  variant="outlined"
                  onClick={verifyWebhook}
                  disabled={testingWebhook}
                  sx={{ textTransform: "none" }}
                >
                  ทดสอบลิงก์รับข้อความ
                </Button>
                {connection?.isConnected ? (
                  <Button
                    variant="text"
                    color="error"
                    onClick={disconnectLine}
                    sx={{ textTransform: "none" }}
                  >
                    ลบการเชื่อมต่อ
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} className="partner-card rounded-[30px]!">
          <CardContent className="p-6!">
            <Stack spacing={2.5}>
              <Box>
                <Typography className="text-lg font-black text-slate-950">
                  กิจกรรมล่าสุดจากบัญชีไลน์
                </Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  ใช้เช็กว่าร้านนี้ได้รับข้อความและทดสอบการเชื่อมต่อแล้วหรือยัง
                </Typography>
              </Box>

              {current?.recentEvents?.length ? (
                <Stack divider={<Divider />}>
                  {current.recentEvents.map((event) => (
                    <Box key={event.id} className="py-3">
                      <Stack direction="row" spacing={1} className="items-center">
                        <Chip
                          size="small"
                          label={connectionLabel(event.status)}
                          className={connectionChipClass(event.status)}
                        />
                        <Typography className="text-xs text-slate-500">
                          {formatDate(event.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography className="mt-2 font-bold text-slate-950">
                        {event.subject}
                      </Typography>
                      <Typography className="mt-1 text-sm text-slate-600">
                        {event.body || "-"}
                      </Typography>
                      <Typography className="mt-1 text-xs text-slate-500">
                        ผู้รับ/ต้นทาง: {event.recipient}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box className="partner-empty min-h-60">
                  <Box>
                    <Typography className="text-sm font-semibold text-slate-600">
                      ยังไม่มีกิจกรรมจากบัญชีไลน์ของร้านนี้
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-500">
                      หลังจากทดสอบลิงก์รับข้อความ หรือมีลูกค้าทักเข้ามา กิจกรรมจะมาแสดงตรงนี้
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <PageSnack snack={snack} onClose={close} />
    </Box>
  );
}
