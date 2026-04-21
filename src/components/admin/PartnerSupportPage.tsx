"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { supportService } from "@/src/services/support/support.service";
import type {
  PartnerSupportOwner,
  PartnerSupportTicket,
} from "@/src/services/support/support.types";

type Snack = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function channelLabel(value: string) {
  const map: Record<string, string> = {
    line: "LINE OA",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    phone: "โทรศัพท์",
    webform: "ฟอร์มเว็บ",
  };
  return map[value] || value;
}

function statusLabel(value: string) {
  const map: Record<string, string> = {
    new: "ใหม่",
    open: "กำลังดูแล",
    waiting: "รอลูกค้า",
    resolved: "แก้ไขแล้ว",
    closed: "ปิดเคส",
  };
  return map[value] || value;
}

function priorityLabel(value: string) {
  const map: Record<string, string> = {
    low: "ต่ำ",
    normal: "ปกติ",
    high: "สูง",
    urgent: "ด่วน",
  };
  return map[value] || value;
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

export function PartnerSupportPage() {
  const [tickets, setTickets] = React.useState<PartnerSupportTicket[]>([]);
  const [owners, setOwners] = React.useState<PartnerSupportOwner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState("");
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<PartnerSupportTicket["status"] | "all">("all");
  const [priority, setPriority] = React.useState<PartnerSupportTicket["priority"] | "all">("all");
  const [reply, setReply] = React.useState("");
  const [note, setNote] = React.useState("");
  const [savingReply, setSavingReply] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const { snack, setSnack, close } = useSnack();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await supportService.getSupportTickets();
      setTickets(response.items);
      setOwners(response.owners);
      setSelectedId((prev) => {
        if (prev && response.items.some((item) => item.id === prev)) {
          return prev;
        }
        return response.items[0]?.id || "";
      });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "โหลดข้อมูลซัพพอร์ตไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [setSnack]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filteredTickets = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchQuery =
        !query ||
        ticket.subject.toLowerCase().includes(query) ||
        (ticket.customerName || "").toLowerCase().includes(query) ||
        (ticket.phone || "").toLowerCase().includes(query) ||
        (ticket.bookingCode || "").toLowerCase().includes(query);
      const matchStatus = status === "all" ? true : ticket.status === status;
      const matchPriority = priority === "all" ? true : ticket.priority === priority;
      return matchQuery && matchStatus && matchPriority;
    });
  }, [priority, q, status, tickets]);

  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedId) ||
    tickets.find((ticket) => ticket.id === selectedId) ||
    null;

  async function updateTicket(
    ticketId: string,
    input: {
      status?: PartnerSupportTicket["status"];
      priority?: PartnerSupportTicket["priority"];
      ownerEmail?: string;
    },
    message: string
  ) {
    try {
      await supportService.updateSupportTicket(ticketId, input);
      await load();
      setSnack({ open: true, message, severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "อัปเดต ticket ไม่สำเร็จ",
        severity: "error",
      });
    }
  }

  async function sendReply() {
    if (!selectedTicket || !reply.trim()) return;
    setSavingReply(true);
    try {
      await supportService.createSupportMessage(selectedTicket.id, {
        message: reply.trim(),
      });
      setReply("");
      await load();
      setSnack({ open: true, message: "ส่งข้อความตอบกลับสำเร็จ", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "ส่งข้อความไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setSavingReply(false);
    }
  }

  async function saveNote() {
    if (!selectedTicket || !note.trim()) return;
    setSavingNote(true);
    try {
      await supportService.createSupportMessage(selectedTicket.id, {
        message: note.trim(),
        isInternal: true,
      });
      setNote("");
      await load();
      setSnack({ open: true, message: "บันทึกโน้ตสำเร็จ", severity: "success" });
    } catch (error: unknown) {
      setSnack({
        open: true,
        message: error instanceof Error ? error.message : "บันทึกโน้ตไม่สำเร็จ",
        severity: "error",
      });
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <Box className="grid gap-4">
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        className="items-start justify-between lg:items-center"
      >
        <Box>
          <Typography variant="h6" className="text-xl font-extrabold text-slate-900">
            ซัพพอร์ตลูกค้า
          </Typography>
          <Typography className="text-sm text-slate-600">
            ดึงข้อมูล ticket และข้อความจริงจากฐานข้อมูลของร้าน รวมทั้งข้อความจาก LINE OA
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={load}
          sx={{ textTransform: "none" }}
        >
          รีเฟรช
        </Button>
      </Stack>

      <Box className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-5!">
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
                <TextField
                  label="ค้นหา ticket"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  select
                  label="สถานะ"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as typeof status)}
                  size="small"
                  className="w-full md:w-40"
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="new">ใหม่</MenuItem>
                  <MenuItem value="open">กำลังดูแล</MenuItem>
                  <MenuItem value="waiting">รอลูกค้า</MenuItem>
                  <MenuItem value="resolved">แก้ไขแล้ว</MenuItem>
                  <MenuItem value="closed">ปิดเคส</MenuItem>
                </TextField>
                <TextField
                  select
                  label="ความสำคัญ"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as typeof priority)}
                  size="small"
                  className="w-full md:w-40"
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="low">ต่ำ</MenuItem>
                  <MenuItem value="normal">ปกติ</MenuItem>
                  <MenuItem value="high">สูง</MenuItem>
                  <MenuItem value="urgent">ด่วน</MenuItem>
                </TextField>
              </Stack>

              {loading ? (
                <Box className="grid min-h-80 place-items-center text-sm text-slate-500">
                  กำลังโหลด ticket...
                </Box>
              ) : filteredTickets.length === 0 ? (
                <Box className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                  <Box>
                    <ChatRoundedIcon className="text-slate-400" sx={{ fontSize: 42 }} />
                    <Typography className="mt-3 text-sm font-semibold text-slate-600">
                      ยังไม่มี ticket จากข้อมูลจริง
                    </Typography>
                    <Typography className="mt-1 text-sm text-slate-500">
                      เมื่อมีข้อความจาก LINE OA หรือทีมงานเริ่มตอบกลับ ข้อมูลจะมาแสดงตรงนี้
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {filteredTickets.map((ticket) => (
                    <Box
                      key={ticket.id}
                      className="cursor-pointer rounded-2xl px-3 py-3 transition"
                      sx={{
                        bgcolor: ticket.id === selectedTicket?.id ? "rgba(15,23,42,0.04)" : "transparent",
                      }}
                      onClick={() => setSelectedId(ticket.id)}
                    >
                      <Stack direction="row" spacing={1} className="items-center">
                        <Chip size="small" label={channelLabel(ticket.channel)} variant="outlined" />
                        <Chip size="small" label={statusLabel(ticket.status)} />
                        <Chip size="small" label={priorityLabel(ticket.priority)} variant="outlined" />
                      </Stack>
                      <Typography className="mt-3 font-black text-slate-950">
                        {ticket.subject}
                      </Typography>
                      <Typography className="mt-1 text-sm text-slate-600">
                        {(ticket.customerName || "ลูกค้า") + (ticket.phone ? ` • ${ticket.phone}` : "")}
                      </Typography>
                      <Typography className="mt-2 text-sm text-slate-500 line-clamp-2">
                        {ticket.lastMessage || "ยังไม่มีข้อความล่าสุด"}
                      </Typography>
                      <Typography className="mt-2 text-xs text-slate-400">
                        อัปเดตล่าสุด {formatDate(ticket.updatedAt)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} className="rounded-3xl! border border-slate-200 bg-white">
          <CardContent className="p-5!">
            {!selectedTicket ? (
              <Box className="grid min-h-80 place-items-center text-center">
                <Typography className="text-sm text-slate-500">
                  เลือก ticket เพื่อดูรายละเอียด
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} className="items-start justify-between">
                    <Box>
                      <Typography className="text-xl font-black text-slate-950">
                        {selectedTicket.subject}
                      </Typography>
                      <Typography className="mt-1 text-sm text-slate-600">
                        {selectedTicket.customerName || "ลูกค้า"} {selectedTicket.phone ? `• ${selectedTicket.phone}` : ""}
                        {selectedTicket.bookingCode ? ` • ${selectedTicket.bookingCode}` : ""}
                      </Typography>
                    </Box>
                    <Chip label={channelLabel(selectedTicket.channel)} variant="outlined" />
                  </Stack>
                </Box>

                <Box className="grid gap-3 md:grid-cols-3">
                  <TextField
                    select
                    label="สถานะ"
                    size="small"
                    value={selectedTicket.status}
                    onChange={(event) =>
                      updateTicket(
                        selectedTicket.id,
                        { status: event.target.value as PartnerSupportTicket["status"] },
                        "อัปเดตสถานะสำเร็จ"
                      )
                    }
                  >
                    <MenuItem value="new">ใหม่</MenuItem>
                    <MenuItem value="open">กำลังดูแล</MenuItem>
                    <MenuItem value="waiting">รอลูกค้า</MenuItem>
                    <MenuItem value="resolved">แก้ไขแล้ว</MenuItem>
                    <MenuItem value="closed">ปิดเคส</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="ความสำคัญ"
                    size="small"
                    value={selectedTicket.priority}
                    onChange={(event) =>
                      updateTicket(
                        selectedTicket.id,
                        { priority: event.target.value as PartnerSupportTicket["priority"] },
                        "อัปเดตความสำคัญสำเร็จ"
                      )
                    }
                  >
                    <MenuItem value="low">ต่ำ</MenuItem>
                    <MenuItem value="normal">ปกติ</MenuItem>
                    <MenuItem value="high">สูง</MenuItem>
                    <MenuItem value="urgent">ด่วน</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="ผู้รับผิดชอบ"
                    size="small"
                    value={selectedTicket.ownerEmail || ""}
                    onChange={(event) =>
                      updateTicket(
                        selectedTicket.id,
                        { ownerEmail: event.target.value || "" },
                        "อัปเดตผู้รับผิดชอบสำเร็จ"
                      )
                    }
                  >
                    <MenuItem value="">ยังไม่มอบหมาย</MenuItem>
                    {owners.map((owner) => (
                      <MenuItem key={owner.email} value={owner.email}>
                        {owner.name || owner.email}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Divider />

                <Box>
                  <Typography className="font-black text-slate-950">ข้อความในเคส</Typography>
                  <Stack spacing={1.5} className="mt-3 max-h-[320px] overflow-auto pr-1">
                    {selectedTicket.messages.length ? (
                      selectedTicket.messages.map((message) => (
                        <Box
                          key={message.id}
                          className="rounded-2xl border border-slate-200 p-3"
                          sx={{
                            bgcolor:
                              message.from === "customer"
                                ? "rgb(248 250 252)"
                                : "rgb(240 253 250)",
                          }}
                        >
                          <Stack direction="row" spacing={1} className="items-center">
                            <Chip
                              size="small"
                              label={
                                message.from === "customer"
                                  ? "ลูกค้า"
                                  : message.from === "agent"
                                    ? "ทีมงาน"
                                    : "ระบบ"
                              }
                              variant="outlined"
                            />
                            <Typography className="text-xs text-slate-500">
                              {formatDate(message.at)}
                            </Typography>
                          </Stack>
                          <Typography className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                            {message.text}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography className="text-sm text-slate-500">
                        ยังไม่มีข้อความในเคสนี้
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <TextField
                  label="ตอบกลับลูกค้า"
                  multiline
                  minRows={3}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับผ่าน LINE OA หรือบันทึกลงประวัติเคส"
                />
                <Button
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  onClick={sendReply}
                  disabled={!reply.trim() || savingReply}
                  sx={{ textTransform: "none", bgcolor: "rgb(15 23 42)" }}
                >
                  {savingReply ? "กำลังส่ง..." : "ส่งข้อความตอบกลับ"}
                </Button>

                <Divider />

                <Box>
                  <Stack direction="row" spacing={1.25} className="items-center">
                    <NotesRoundedIcon />
                    <Typography className="font-black text-slate-950">โน้ตภายในทีม</Typography>
                  </Stack>
                  <Stack spacing={1.5} className="mt-3">
                    {selectedTicket.internalNotes.length ? (
                      selectedTicket.internalNotes.map((noteItem) => (
                        <Box key={noteItem.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <Typography className="text-xs text-amber-800">
                            {formatDate(noteItem.at)}
                          </Typography>
                          <Typography className="mt-1 whitespace-pre-wrap text-sm text-amber-900">
                            {noteItem.text}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography className="text-sm text-slate-500">
                        ยังไม่มีโน้ตภายใน
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <TextField
                  label="เพิ่มโน้ตภายใน"
                  multiline
                  minRows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="โน้ตนี้จะเก็บในระบบและไม่ส่งถึงลูกค้า"
                />
                <Button
                  variant="outlined"
                  startIcon={<NotesRoundedIcon />}
                  onClick={saveNote}
                  disabled={!note.trim() || savingNote}
                  sx={{ textTransform: "none" }}
                >
                  {savingNote ? "กำลังบันทึก..." : "บันทึกโน้ตภายใน"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={close}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={close}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
