"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { storefrontService } from "@/src/services/storefront/storefront.service";
import type {
  StorefrontBlock,
  StorefrontPage,
} from "@/src/services/storefront/storefront.types";

const emptyBlock: StorefrontBlock = {
  type: "feature",
  title: "",
  subtitle: "",
  description: "",
  buttonLabel: "",
  href: "",
  tone: "default",
  align: "left",
};

const emptyTheme: NonNullable<StorefrontPage["theme"]> = {
  primaryColor: "#2563eb",
  accentColor: "#0f172a",
  surfaceColor: "#f8fafc",
};

function blockToneLabel(tone?: StorefrontBlock["tone"]) {
  if (tone === "highlight") return "เน้นโปรโมชัน";
  if (tone === "dark") return "พื้นเข้ม";
  if (tone === "success") return "เชิงความมั่นใจ";
  return "มาตรฐาน";
}

export default function Page() {
  const [blocks, setBlocks] = React.useState<StorefrontBlock[]>([]);
  const [theme, setTheme] =
    React.useState<NonNullable<StorefrontPage["theme"]>>(emptyTheme);
  const [isPublished, setIsPublished] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    storefrontService
      .getHomePage()
      .then((page) => {
        if (cancelled) return;
        setBlocks(page.blocks?.length ? page.blocks : []);
        setTheme({
          ...emptyTheme,
          ...(page.theme || {}),
        });
        setIsPublished(page.isPublished ?? true);
      })
      .catch(() => {
        if (!cancelled) {
          setBlocks([]);
          setTheme(emptyTheme);
          setIsPublished(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateBlock(index: number, patch: Partial<StorefrontBlock>) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block
      )
    );
  }

  async function save() {
    setSaving(true);
    try {
      await storefrontService.saveHomePage({
        blocks: blocks.map((block, index) => ({
          ...block,
          id: block.id || `block-${index + 1}`,
        })),
        theme,
        isPublished,
      });
      setMessage("บันทึกหน้าเว็บเรียบร้อยแล้ว");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "บันทึกหน้าเว็บไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box className="partner-page">
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="partner-page-header partner-page-header-with-action items-start justify-between md:items-end"
      >
        <Box>
          <Typography className="partner-page-title">
            จัดหน้าเว็บร้าน
          </Typography>
          <Typography className="partner-page-subtitle">
            จัด section หน้าแรก สีหลักของร้าน และสถานะการเผยแพร่ให้พร้อมใช้งานจริง
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={save}
          disabled={saving}
          className="h-12 rounded-full! bg-slate-950! px-8! text-base! font-bold! max-md:w-full"
        >
          {saving ? "กำลังบันทึก" : "บันทึกหน้าเว็บ"}
        </Button>
      </Stack>

      <Card elevation={0} className="partner-card rounded-[34px]!">
        <CardContent className="grid gap-6">
          {loading ? (
            <Box className="flex min-h-[220px] items-center justify-center">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <Box className="grid gap-4 rounded-[28px] bg-slate-50 p-5">
                  <Box>
                    <Typography className="text-xl font-black text-slate-950">
                      ธีมของหน้าร้าน
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-500">
                      สีเหล่านี้จะถูกใช้กับปุ่ม บล็อกเด่น และพื้นหลัง section บางส่วนของหน้าแรก
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      label="สีปุ่มหลัก"
                      value={theme.primaryColor || ""}
                      onChange={(event) =>
                        setTheme((current) => ({
                          ...current,
                          primaryColor: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="สีข้อความเข้ม"
                      value={theme.accentColor || ""}
                      onChange={(event) =>
                        setTheme((current) => ({
                          ...current,
                          accentColor: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="สีพื้นบล็อกเด่น"
                      value={theme.surfaceColor || ""}
                      onChange={(event) =>
                        setTheme((current) => ({
                          ...current,
                          surfaceColor: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Stack>
                </Box>

                <Box className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5">
                  <Box className="flex items-center justify-between gap-3">
                    <Box>
                      <Typography className="text-lg font-black text-slate-950">
                        สถานะหน้าเว็บ
                      </Typography>
                      <Typography className="mt-1 text-sm text-slate-500">
                        ปิดการเผยแพร่ได้ชั่วคราว ถ้ายังจัดหน้าไม่เสร็จ
                      </Typography>
                    </Box>
                    <Switch
                      checked={isPublished}
                      onChange={(event) => setIsPublished(event.target.checked)}
                    />
                  </Box>
                  <Box
                    className="rounded-[24px] p-4"
                    sx={{
                      backgroundColor: isPublished ? "#ecfdf5" : "#fff7ed",
                    }}
                  >
                    <Typography className="text-sm font-bold text-slate-950">
                      {isPublished ? "ตอนนี้หน้าเว็บเปิดใช้งานอยู่" : "ตอนนี้หน้าเว็บยังไม่เผยแพร่"}
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-500">
                      {isPublished
                        ? "ลูกค้าจะเห็นบล็อกที่คุณจัดไว้บนหน้าแรกทันทีหลังบันทึก"
                        : "ระบบจะซ่อนบล็อกชุดนี้ไว้ก่อนจนกว่าคุณจะเปิดใช้งานอีกครั้ง"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {blocks.length === 0 ? (
                <Box className="rounded-[28px] bg-slate-50 p-8 text-center">
                  <Typography className="font-bold text-slate-950">ยังไม่มีบล็อกหน้าเว็บ</Typography>
                  <Typography className="mt-1 text-sm text-slate-500">
                    กดเพิ่มบล็อกเพื่อเริ่มจัดหน้าร้านของคุณ
                  </Typography>
                </Box>
              ) : (
                blocks.map((block, index) => (
                  <Box key={block.id || index} className="grid gap-4 rounded-[28px] border border-slate-200 p-5">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        select
                        label="รูปแบบ"
                        value={block.type || "feature"}
                        onChange={(event) =>
                          updateBlock(index, { type: event.target.value as StorefrontBlock["type"] })
                        }
                        fullWidth
                      >
                        <MenuItem value="feature">ข้อมูลเด่น</MenuItem>
                        <MenuItem value="announcement">ประกาศ</MenuItem>
                        <MenuItem value="cta">ปุ่มนำทาง</MenuItem>
                        <MenuItem value="text">ข้อความ</MenuItem>
                      </TextField>
                      <TextField
                        select
                        label="โทน"
                        value={block.tone || "default"}
                        onChange={(event) =>
                          updateBlock(index, { tone: event.target.value as StorefrontBlock["tone"] })
                        }
                        fullWidth
                      >
                        <MenuItem value="default">มาตรฐาน</MenuItem>
                        <MenuItem value="highlight">เน้นโปรโมชัน</MenuItem>
                        <MenuItem value="dark">พื้นเข้ม</MenuItem>
                        <MenuItem value="success">เชิงความมั่นใจ</MenuItem>
                      </TextField>
                      <TextField
                        select
                        label="การจัดวาง"
                        value={block.align || "left"}
                        onChange={(event) =>
                          updateBlock(index, { align: event.target.value as StorefrontBlock["align"] })
                        }
                        fullWidth
                      >
                        <MenuItem value="left">ชิดซ้าย</MenuItem>
                        <MenuItem value="center">กึ่งกลาง</MenuItem>
                      </TextField>
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        label="หัวข้อรอง"
                        value={block.subtitle || ""}
                        onChange={(event) => updateBlock(index, { subtitle: event.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="หัวข้อหลัก"
                        value={block.title || ""}
                        onChange={(event) => updateBlock(index, { title: event.target.value })}
                        fullWidth
                      />
                    </Stack>

                    <TextField
                      label="คำอธิบาย"
                      value={block.description || ""}
                      onChange={(event) => updateBlock(index, { description: event.target.value })}
                      multiline
                      minRows={3}
                      fullWidth
                    />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <TextField
                        label="ข้อความปุ่ม"
                        value={block.buttonLabel || ""}
                        onChange={(event) => updateBlock(index, { buttonLabel: event.target.value })}
                        fullWidth
                      />
                      <TextField
                        label="ลิงก์ปุ่ม"
                        value={block.href || ""}
                        onChange={(event) => updateBlock(index, { href: event.target.value })}
                        fullWidth
                      />
                    </Stack>

                    <Box
                      className="rounded-[24px] p-4"
                      sx={{
                        backgroundColor:
                          block.tone === "highlight"
                            ? theme.surfaceColor || "#f8fafc"
                            : block.tone === "dark"
                              ? theme.accentColor || "#0f172a"
                              : block.tone === "success"
                                ? "#ecfdf5"
                                : "#ffffff",
                        color: block.tone === "dark" ? "#ffffff" : theme.accentColor || "#0f172a",
                        border:
                          block.tone === "default"
                            ? "1px solid rgba(15, 23, 42, 0.08)"
                            : "1px solid transparent",
                        textAlign: block.align === "center" ? "center" : "left",
                      }}
                    >
                      <Typography className="text-sm font-bold">
                        ตัวอย่างบล็อก: {blockToneLabel(block.tone)}
                      </Typography>
                      <Typography className="mt-2 text-xl font-black">
                        {block.title || "หัวข้อของคุณจะขึ้นตรงนี้"}
                      </Typography>
                      <Typography className="mt-2 text-sm opacity-80">
                        {block.description || "ใช้ส่วนนี้สำหรับสรุปโปรโมชัน จุดขาย หรือคำอธิบายสั้น ๆ ของร้าน"}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          setBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index))
                        }
                        className="rounded-full!"
                      >
                        ลบบล็อก
                      </Button>
                    </Stack>

                    {index < blocks.length - 1 ? <Divider /> : null}
                  </Box>
                ))
              )}

              <Button
                variant="outlined"
                onClick={() => setBlocks((current) => [...current, { ...emptyBlock }])}
                className="h-12 rounded-full! text-base! font-bold!"
              >
                เพิ่มบล็อก
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2200}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={message.includes("ไม่สำเร็จ") ? "error" : "success"}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}
