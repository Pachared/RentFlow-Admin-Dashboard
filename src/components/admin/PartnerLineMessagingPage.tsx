"use client";

import * as React from "react";
import {
  Alert,
  Avatar,
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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SettingsEthernetRoundedIcon from "@mui/icons-material/SettingsEthernetRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

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
        <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
          {title}
        </Typography>
        <Typography className="text-sm text-slate-600">{description}</Typography>
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
    default:
      return "ยังไม่เชื่อม";
  }
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
        message: error instanceof Error ? error.message : "โหลดข้อมูล LINE OA ไม่สำเร็จ",
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
      setSnack({ open: true, message: "คัดลอก Webhook URL แล้ว", severity: "success" });
    } catch {
      setSnack({ open: true, message: "คัดลอก Webhook URL ไม่สำเร็จ", severity: "error" });
    }
  }

  async function saveConnection() {
    if (!form.channelId.trim() || !form.channelSecret.trim() || !form.accessToken.trim()) {
      setSnack({
        open: true,
        message: "กรุณากรอก Channel ID, Channel Secret และ Access Token ให้ครบ",
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
      setSnack({ open: true, message: "บันทึก LINE OA สำเร็จ", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "บันทึก LINE OA ไม่สำเร็จ",
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
      setSnack({ open: true, message: "✅ ตรวจสอบการเชื่อมต่อผ่านแล้ว", severity: "success" });
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
          ? "ทดสอบ Webhook ผ่านแล้ว"
          : result.webhookTest.reason || "Webhook ยังไม่ผ่าน",
        severity: result.webhookTest.success ? "success" : "info",
      });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ทดสอบ Webhook ไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setTestingWebhook(false);
    }
  }

  async function disconnectLine() {
    if (!window.confirm("ต้องการลบการเชื่อมต่อ LINE OA ของร้านนี้ใช่หรือไม่")) {
      return;
    }
    try {
      await lineService.deleteLineMessaging();
      await load();
      setSnack({ open: true, message: "ลบการเชื่อมต่อ LINE OA แล้ว", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ลบการเชื่อมต่อ LINE OA ไม่สำเร็จ",
        severity: "error",
      });
    }
  }

  if (loading) {
    return (
      <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
        <CardContent className="grid min-h-[420px] place-items-center">
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box className="grid gap-4">
      <SectionHeader
        title="เชื่อม LINE OA ของร้าน"
        description="ร้านแต่ละเจ้าจะใช้ LINE OA ของตัวเอง ลูกค้าเห็นชื่อร้านจริง และ webhook แยกกันอัตโนมัติ"
        action={
          <Button
            variant="outlined"
            onClick={() => setGuideOpen((prev) => !prev)}
            startIcon={<QuizRoundedIcon />}
            sx={{ textTransform: "none" }}
          >
            {guideOpen ? "ซ่อนคู่มือ" : "เปิดคู่มือ"}
          </Button>
        }
      />

      <Card
        elevation={0}
        className="overflow-hidden rounded-3xl! border border-emerald-200"
        sx={{
          background:
            "linear-gradient(135deg, rgba(236,253,245,1) 0%, rgba(240,253,250,1) 45%, rgba(255,255,255,1) 100%)",
        }}
      >
        {(saving || testing || testingWebhook) && <LinearProgress />}
        <CardContent className="p-6!">
          <Stack direction={{ xs: "column", lg: "row" }} spacing={3} className="justify-between">
            <Stack direction="row" spacing={2} className="items-start">
              <Avatar
                src={current?.pictureUrl || undefined}
                sx={{ width: 64, height: 64, bgcolor: "#065f46" }}
              >
                <ChatRoundedIcon />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} className="items-center">
                  <Typography className="text-lg font-black text-slate-950">
                    {current?.displayName || current?.shopName || "LINE OA ของร้าน"}
                  </Typography>
                  <Chip
                    color={current?.isConnected ? "success" : "default"}
                    label={connectionLabel(current?.status)}
                    size="small"
                  />
                  {previewMode ? (
                    <Chip
                      color="warning"
                      label="ยังไม่ได้บันทึก"
                      size="small"
                      variant="outlined"
                    />
                  ) : null}
                </Stack>
                <Typography className="mt-1 text-sm text-slate-600">
                  {current?.basicId
                    ? `LINE Basic ID: ${current.basicId}`
                    : "เชื่อมร้านนี้กับ LINE Official Account ของตัวเองได้จากหน้านี้"}
                </Typography>
                <Typography className="mt-2 text-sm text-slate-500">
                  ตรวจสอบล่าสุด: {formatDate(current?.lastVerifiedAt)}
                </Typography>
                {current?.lastWebhookTestStatus ? (
                  <Typography className="text-sm text-slate-500">
                    สถานะ Webhook: {current.lastWebhookTestStatus}
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
                startIcon={<CheckCircleRoundedIcon />}
                sx={{ textTransform: "none", bgcolor: "#047857" }}
              >
                ตรวจสอบการเชื่อมต่อ
              </Button>
              <Button
                variant="outlined"
                onClick={verifyWebhook}
                disabled={testingWebhook}
                startIcon={<SettingsEthernetRoundedIcon />}
                sx={{ textTransform: "none" }}
              >
                ทดสอบ Webhook
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
              icon: <StorefrontRoundedIcon sx={{ fontSize: 28 }} />,
              title: "Step 1 สร้าง LINE OA",
              description: "สร้างบัญชี LINE Official Account ของร้าน แล้วเลือกชื่อร้านจริงที่ลูกค้าจะเห็นในแชท",
              href: "https://manager.line.biz/",
              button: "ไปหน้า LINE OA",
            },
            {
              icon: <LinkRoundedIcon sx={{ fontSize: 28 }} />,
              title: "Step 2 เปิด Messaging API",
              description: "เข้า LINE Developers Console แล้วเปิด Messaging API ของ OA เพื่อใช้งาน webhook และ bot info",
              href: "https://developers.line.biz/console/",
              button: "เปิด LINE Developers",
            },
            {
              icon: <SettingsEthernetRoundedIcon sx={{ fontSize: 28 }} />,
              title: "Step 3 วางค่าลงในระบบ",
              description: "คัดลอก Channel ID, Channel Secret และ Access Token มาใส่ด้านล่าง แล้วกดตรวจสอบการเชื่อมต่อ",
              href: "https://developers.line.biz/en/docs/messaging-api/getting-started/",
              button: "เปิดคู่มือทางการ",
            },
          ].map((step) => (
            <Card
              key={step.title}
              elevation={0}
              className="rounded-3xl! border border-slate-200 bg-white"
            >
              <CardContent className="h-full p-5!">
                <Stack spacing={2} className="h-full">
                  <Box
                    className="grid h-12 w-12 place-items-center rounded-2xl"
                    sx={{ bgcolor: "rgba(15,23,42,0.06)", color: "rgb(15 23 42)" }}
                  >
                    {step.icon}
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
                      endIcon={<LaunchRoundedIcon />}
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
        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-6!">
            <Stack spacing={3}>
              <Box>
                <Typography className="text-lg font-black text-slate-950">
                  ข้อมูลสำหรับเชื่อมต่อ
                </Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  ใส่ค่าจาก LINE Developers Console ให้ครบ แล้วค่อยกดตรวจสอบการเชื่อมต่อ
                </Typography>
              </Box>

              <TextField
                label="Channel ID"
                value={form.channelId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, channelId: event.target.value }))
                }
                fullWidth
                placeholder="เช่น 2001234567"
                helperText={
                  connection?.channelId && !form.channelId
                    ? `ระบบมีค่าเดิม: ${connection.channelId}`
                    : "คัดลอกจาก Basic settings ของช่องทาง Messaging API"
                }
              />

              <TextField
                label="Channel Secret"
                type="password"
                value={form.channelSecret}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, channelSecret: event.target.value }))
                }
                fullWidth
                placeholder="ใส่ Channel Secret"
                helperText={
                  connection?.hasChannelSecret
                    ? "ถ้าไม่เปลี่ยนค่าเดิม สามารถเว้นว่างไว้ตอนกดทดสอบได้"
                    : "คัดลอกจาก Basic settings ของช่องทาง Messaging API"
                }
              />

              <TextField
                label="Access Token"
                type="password"
                value={form.accessToken}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, accessToken: event.target.value }))
                }
                fullWidth
                placeholder="ใส่ Channel Access Token"
                helperText={
                  connection?.hasAccessToken
                    ? "ถ้าไม่เปลี่ยนค่าเดิม สามารถเว้นว่างไว้ตอนกดทดสอบได้"
                    : "ใช้ Channel access token ของ Messaging API"
                }
              />

              <Divider />

              <Box>
                <Typography className="font-black text-slate-950">Webhook URL</Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  เอา URL นี้ไปวางใน LINE Developers Console แล้วเปิด Use webhook จากนั้นค่อยกดทดสอบ
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <TextField value={webhookUrl} fullWidth InputProps={{ readOnly: true }} />
                <Button
                  variant="outlined"
                  onClick={copyWebhookUrl}
                  startIcon={<ContentCopyRoundedIcon />}
                  sx={{ textTransform: "none", minWidth: 128 }}
                >
                  Copy
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
                  ทดสอบ Webhook
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

        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-6!">
            <Stack spacing={2.5}>
              <Box>
                <Typography className="text-lg font-black text-slate-950">
                  กิจกรรมล่าสุดจาก LINE
                </Typography>
                <Typography className="mt-1 text-sm text-slate-600">
                  ใช้เช็กว่าร้านนี้ได้รับ event และทดสอบ webhook แล้วหรือยัง
                </Typography>
              </Box>

              {current?.recentEvents?.length ? (
                <Stack divider={<Divider />}>
                  {current.recentEvents.map((event) => (
                    <Box key={event.id} className="py-3">
                      <Stack direction="row" spacing={1} className="items-center">
                        <Chip size="small" label={event.status} variant="outlined" />
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
                <Box className="grid min-h-60 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                  <Box>
                    <ChatRoundedIcon className="text-slate-400" sx={{ fontSize: 42 }} />
                    <Typography className="mt-3 text-sm font-semibold text-slate-600">
                      ยังไม่มี event จาก LINE OA ของร้านนี้
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-500">
                      หลังจากทดสอบ webhook หรือมีลูกค้าทักเข้ามา กิจกรรมจะมาแสดงตรงนี้
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
