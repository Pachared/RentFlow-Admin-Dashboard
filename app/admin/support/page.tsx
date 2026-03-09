"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Drawer,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";

type TicketStatus = "new" | "open" | "waiting" | "resolved" | "closed";
type Priority = "low" | "normal" | "high" | "urgent";
type Channel = "line" | "facebook" | "whatsapp" | "phone" | "webform";
type Branch = "bkk" | "spb";

type Message = {
  id: string;
  at: string;
  from: "customer" | "agent" | "system";
  text: string;
};

type Ticket = {
  id: string;
  subject: string;
  customerName: string;
  phone?: string;
  channel: Channel;
  branch: Branch;
  status: TicketStatus;
  priority: Priority;
  owner: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  bookingId?: string;
  lastMessage: string;
  dueAt?: string | null;
  messages: Message[];
  internalNotes: string[];
};

const ADMINS = ["Unassigned", "Pachara", "Admin A", "Admin B"] as const;

const SEED: Ticket[] = [
  {
    id: "TK-3001",
    subject: "สอบถามมัดจำ + เงื่อนไขรับรถ",
    customerName: "Pachara",
    phone: "0999999999",
    channel: "line",
    branch: "bkk",
    status: "new",
    priority: "high",
    owner: null,
    tags: ["payment", "policy"],
    createdAt: "2026-03-03T10:10:00+07:00",
    updatedAt: "2026-03-03T10:15:00+07:00",
    bookingId: "BK-1004",
    lastMessage: "ขอทราบค่ามัดจำ และต้องใช้เอกสารอะไรบ้างครับ",
    dueAt: "2026-03-04T11:00:00+07:00",
    messages: [
      {
        id: "m1",
        at: "2026-03-03T10:10:00+07:00",
        from: "customer",
        text: "ขอทราบค่ามัดจำ และต้องใช้เอกสารอะไรบ้างครับ",
      },
      {
        id: "m2",
        at: "2026-03-03T10:15:00+07:00",
        from: "system",
        text: "สร้าง Ticket อัตโนมัติจาก LINE",
      },
    ],
    internalNotes: ["ลูกค้าสนใจจอง BMW — ถ้าอนุมัติให้ส่งลิงก์ชำระมัดจำ"],
  },
  {
    id: "TK-3002",
    subject: "ขอเลื่อนวันรับรถ",
    customerName: "Somchai",
    phone: "0888888888",
    channel: "facebook",
    branch: "spb",
    status: "open",
    priority: "normal",
    owner: "Admin A",
    tags: ["booking", "change-date"],
    createdAt: "2026-03-02T18:40:00+07:00",
    updatedAt: "2026-03-03T09:05:00+07:00",
    bookingId: "BK-1002",
    lastMessage: "ถ้าเลื่อนได้เป็นวันเสาร์แทนได้ไหมครับ",
    dueAt: null,
    messages: [
      {
        id: "m1",
        at: "2026-03-02T18:40:00+07:00",
        from: "customer",
        text: "ถ้าเลื่อนได้เป็นวันเสาร์แทนได้ไหมครับ",
      },
      {
        id: "m2",
        at: "2026-03-03T09:05:00+07:00",
        from: "agent",
        text: "ได้ครับ ขอทราบเวลารับรถใหม่ที่ต้องการด้วยครับ",
      },
    ],
    internalNotes: ["เช็คคิวรถก่อนตอบยืนยัน"],
  },
  {
    id: "TK-3003",
    subject: "ส่งสลิปแล้วแต่ยังไม่ยืนยัน",
    customerName: "Nok",
    phone: "0777777777",
    channel: "whatsapp",
    branch: "bkk",
    status: "waiting",
    priority: "urgent",
    owner: "Pachara",
    tags: ["payment", "verification"],
    createdAt: "2026-03-01T12:05:00+07:00",
    updatedAt: "2026-03-03T16:20:00+07:00",
    bookingId: "BK-1001",
    lastMessage: "ส่งสลิปไปเมื่อกี้ค่ะ ช่วยเช็คให้หน่อย",
    dueAt: "2026-03-03T18:00:00+07:00",
    messages: [
      {
        id: "m1",
        at: "2026-03-03T16:20:00+07:00",
        from: "customer",
        text: "ส่งสลิปไปเมื่อกี้ค่ะ ช่วยเช็คให้หน่อย",
      },
      {
        id: "m2",
        at: "2026-03-03T16:25:00+07:00",
        from: "agent",
        text: "รับทราบค่ะ กำลังตรวจสอบให้ ตอนนี้เห็นสลิปแล้วนะคะ",
      },
    ],
    internalNotes: ["รีบเช็คยอดเข้าบัญชี — urgent"],
  },
  {
    id: "TK-3004",
    subject: "สอบถามโปรโมชัน",
    customerName: "Beam",
    phone: "0666666666",
    channel: "phone",
    branch: "spb",
    status: "resolved",
    priority: "low",
    owner: "Admin B",
    tags: ["promotion"],
    createdAt: "2026-02-28T09:20:00+07:00",
    updatedAt: "2026-03-01T10:00:00+07:00",
    bookingId: undefined,
    lastMessage: "ขอบคุณครับ เดี๋ยวตัดสินใจอีกที",
    dueAt: null,
    messages: [
      {
        id: "m1",
        at: "2026-02-28T09:20:00+07:00",
        from: "customer",
        text: "มีโปรลดสำหรับเช่า 3 วันไหมครับ",
      },
      {
        id: "m2",
        at: "2026-02-28T09:40:00+07:00",
        from: "agent",
        text: "มีครับ ถ้าเช่า 3 วันลด 5% และฟรีรับ-ส่งในเมือง",
      },
      {
        id: "m3",
        at: "2026-03-01T10:00:00+07:00",
        from: "customer",
        text: "ขอบคุณครับ เดี๋ยวตัดสินใจอีกที",
      },
    ],
    internalNotes: [],
  },
];

function formatDateTimeTH(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function channelLabel(c: Channel) {
  if (c === "line") return "LINE";
  if (c === "facebook") return "Facebook";
  if (c === "whatsapp") return "WhatsApp";
  if (c === "phone") return "โทร";
  return "Web form";
}

function branchLabel(b: Branch) {
  return b === "bkk" ? "กรุงเทพฯ" : "สุพรรณบุรี";
}

function statusLabel(s: TicketStatus) {
  if (s === "new") return "ใหม่";
  if (s === "open") return "กำลังดำเนินการ";
  if (s === "waiting") return "รอลูกค้าตอบ";
  if (s === "resolved") return "ปิดงานแล้ว";
  return "ปิดถาวร";
}

function priorityLabel(p: Priority) {
  if (p === "urgent") return "ด่วนมาก";
  if (p === "high") return "ด่วน";
  if (p === "normal") return "ปกติ";
  return "ต่ำ";
}

function statusChipSX(s: TicketStatus) {
  if (s === "new") {
    return {
      border: "1px solid rgb(253 230 138)",
      bgcolor: "rgb(254 243 199)",
      color: "rgb(146 64 14)",
    };
  }
  if (s === "open") {
    return {
      border: "1px solid rgb(186 230 253)",
      bgcolor: "rgb(224 242 254)",
      color: "rgb(3 105 161)",
    };
  }
  if (s === "waiting") {
    return {
      border: "1px solid rgb(196 181 253)",
      bgcolor: "rgb(237 233 254)",
      color: "rgb(91 33 182)",
    };
  }
  if (s === "resolved") {
    return {
      border: "1px solid rgb(167 243 208)",
      bgcolor: "rgb(209 250 229)",
      color: "rgb(6 95 70)",
    };
  }
  return {
    border: "1px solid rgb(226 232 240)",
    bgcolor: "rgb(248 250 252)",
    color: "rgb(51 65 85)",
  };
}

function priorityChipSX(p: Priority) {
  if (p === "urgent") {
    return {
      border: "1px solid rgb(254 202 202)",
      bgcolor: "rgb(254 226 226)",
      color: "rgb(153 27 27)",
    };
  }
  if (p === "high") {
    return {
      border: "1px solid rgb(253 230 138)",
      bgcolor: "rgb(254 243 199)",
      color: "rgb(146 64 14)",
    };
  }
  if (p === "normal") {
    return {
      border: "1px solid rgb(226 232 240)",
      bgcolor: "rgb(248 250 252)",
      color: "rgb(51 65 85)",
    };
  }
  return {
    border: "1px solid rgb(226 232 240)",
    bgcolor: "rgb(255 255 255)",
    color: "rgb(100 116 139)",
  };
}

function dueBadge(dueAt?: string | null) {
  if (!dueAt) return null;
  const due = new Date(dueAt);
  const now = new Date();

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);

  if (due.getTime() < now.getTime()) {
    return { label: "เกินกำหนด", tone: "rose" as const };
  }
  if (due >= startToday && due < startTomorrow) {
    return { label: "ติดตามวันนี้", tone: "amber" as const };
  }
  return { label: "มีนัดติดตาม", tone: "slate" as const };
}

function toTelHref(phone?: string) {
  if (!phone) return "#";
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function toChatHref(channel: Channel, t: Ticket) {
  const msg = encodeURIComponent(
    `Ticket ${t.id}\nชื่อ: ${t.customerName}\nโทร: ${t.phone ?? "-"}\nเรื่อง: ${
      t.subject
    }\nสถานะ: ${statusLabel(t.status)}\nรายละเอียดล่าสุด: ${t.lastMessage}`
  );

  if (channel === "line") return `https://line.me/R/msg/text/?${msg}`;
  if (channel === "whatsapp") {
    const p = (t.phone ?? "").replace(/\D/g, "");
    return `https://wa.me/${p}?text=${msg}`;
  }
  return `https://www.facebook.com/messages/`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr]">
      <Typography className="text-sm font-medium text-slate-500">
        {label}
      </Typography>
      <Box className="text-sm font-semibold text-slate-900">{value}</Box>
    </Box>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="rounded-2xl border border-slate-200 bg-white p-4">
      <Typography className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </Typography>
      <Divider className="my-3! border-slate-200!" />
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

export default function AdminSupportPageRealMock() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [rows, setRows] = React.useState<Ticket[]>(SEED);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<TicketStatus | "all">("all");
  const [channel, setChannel] = React.useState<Channel | "all">("all");
  const [priority, setPriority] = React.useState<Priority | "all">("all");
  const [owner, setOwner] =
    React.useState<(typeof ADMINS)[number]>("Unassigned");

  const [openId, setOpenId] = React.useState<string | null>(null);
  const selected = React.useMemo(
    () => rows.find((r) => r.id === openId) ?? null,
    [rows, openId]
  );

  const [reply, setReply] = React.useState("");
  const [note, setNote] = React.useState("");

  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "success",
  });

  const kpi = React.useMemo(() => {
    const total = rows.length;
    const newCount = rows.filter((r) => r.status === "new").length;
    const openCount = rows.filter((r) => r.status === "open").length;
    const waiting = rows.filter((r) => r.status === "waiting").length;
    const resolved = rows.filter((r) => r.status === "resolved").length;
    const overdue = rows.filter(
      (r) =>
        !!r.dueAt &&
        new Date(r.dueAt).getTime() < Date.now() &&
        r.status !== "resolved" &&
        r.status !== "closed"
    ).length;
    return { total, newCount, openCount, waiting, resolved, overdue };
  }, [rows]);

  const roundedFieldSX = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px" },
  };

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (channel === "all" ? true : r.channel === channel))
      .filter((r) => (priority === "all" ? true : r.priority === priority))
      .filter((r) => {
        if (owner === "Unassigned") return true;
        return r.owner === owner;
      })
      .filter((r) => {
        if (!qq) return true;
        return (
          r.id.toLowerCase().includes(qq) ||
          r.customerName.toLowerCase().includes(qq) ||
          (r.phone ?? "").toLowerCase().includes(qq) ||
          r.subject.toLowerCase().includes(qq) ||
          r.lastMessage.toLowerCase().includes(qq) ||
          (r.bookingId ?? "").toLowerCase().includes(qq) ||
          r.tags.join(" ").toLowerCase().includes(qq)
        );
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [rows, q, status, channel, priority, owner]);

  function updateTicket(id: string, patch: Partial<Ticket>) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...patch, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }

  async function copySummary(t: Ticket) {
    try {
      const text = [
        `Ticket ${t.id}`,
        `ลูกค้า: ${t.customerName}`,
        `โทร: ${t.phone ?? "-"}`,
        `ช่องทาง: ${channelLabel(t.channel)}`,
        `สาขา: ${branchLabel(t.branch)}`,
        `สถานะ: ${statusLabel(t.status)}`,
        `Priority: ${priorityLabel(t.priority)}`,
        `Owner: ${t.owner ?? "-"}`,
        `Booking: ${t.bookingId ?? "-"}`,
        `เรื่อง: ${t.subject}`,
        `ล่าสุด: ${t.lastMessage}`,
      ].join("\n");
      await navigator.clipboard.writeText(text);
      setSnack({ open: true, msg: "คัดลอกสรุปแล้ว", type: "success" });
    } catch {
      setSnack({
        open: true,
        msg: "คัดลอกไม่สำเร็จ (Clipboard ถูกบล็อก)",
        type: "error",
      });
    }
  }

  function sendReply() {
    if (!selected) return;
    const text = reply.trim();
    if (!text) {
      setSnack({ open: true, msg: "พิมพ์ข้อความก่อนส่ง", type: "info" });
      return;
    }

    const msg: Message = {
      id: `m-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      from: "agent",
      text,
    };

    updateTicket(selected.id, {
      status: selected.status === "new" ? "open" : selected.status,
      messages: [...selected.messages, msg],
      lastMessage: text,
    });

    setReply("");
    setSnack({ open: true, msg: "ส่งข้อความ (จำลอง) แล้ว", type: "success" });
  }

  function addInternalNote() {
    if (!selected) return;
    const text = note.trim();
    if (!text) {
      setSnack({ open: true, msg: "พิมพ์โน้ตก่อนบันทึก", type: "info" });
      return;
    }

    updateTicket(selected.id, {
      internalNotes: [text, ...selected.internalNotes],
    });

    setNote("");
    setSnack({ open: true, msg: "บันทึกโน้ตภายในแล้ว", type: "success" });
  }

  function deleteTicket(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpenId(null);
    setSnack({ open: true, msg: "ลบ Ticket (จำลอง) แล้ว", type: "info" });
  }

  return (
    <>
      <Box className="grid gap-4">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          className="items-start md:items-center justify-between"
        >
          <Box>
            <Typography
              variant="h6"
              className="text-xl font-extrabold text-slate-900"
            >
              ซัพพอร์ต
            </Typography>
            <Typography className="text-sm text-slate-600">
              Inbox + Ticket • ตอบแชท • Assign • ตั้งเวลาติดตาม • ผูกกับ Booking
            </Typography>
          </Box>
        </Stack>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-4!">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              className="items-start sm:items-center justify-between"
            >
              <Stack direction="row" spacing={1.25} className="items-center">
                <Box className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200">
                  <SupportAgentRoundedIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography className="text-sm font-bold text-slate-900">
                    ทั้งหมด {kpi.total} • ใหม่ {kpi.newCount} • กำลังทำ{" "}
                    {kpi.openCount} • รอตอบ {kpi.waiting} • ปิดงาน{" "}
                    {kpi.resolved}
                    {kpi.overdue ? ` • เกินกำหนด ${kpi.overdue}` : ""}
                  </Typography>
                  <Typography className="mt-1 text-xs text-slate-500">
                    โหมดจำลอง: ยังไม่ต่อ LINE/FB จริง — ใช้ทดสอบ UX/Flow ก่อนต่อ
                    API
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box className="grid gap-4 sm:grid-cols-6">
          {[
            { label: "ทั้งหมด", value: kpi.total, tone: "slate" as const },
            { label: "ใหม่", value: kpi.newCount, tone: "amber" as const },
            { label: "กำลังทำ", value: kpi.openCount, tone: "sky" as const },
            { label: "รอตอบ", value: kpi.waiting, tone: "violet" as const },
            { label: "ปิดงาน", value: kpi.resolved, tone: "emerald" as const },
            { label: "เกินกำหนด", value: kpi.overdue, tone: "rose" as const },
          ].map((x) => (
            <Card
              key={x.label}
              elevation={0}
              className={`rounded-2xl! border ${
                x.tone === "slate"
                  ? "border-slate-200 bg-white"
                  : x.tone === "amber"
                  ? "border-amber-200 bg-amber-50"
                  : x.tone === "sky"
                  ? "border-sky-200 bg-sky-50"
                  : x.tone === "violet"
                  ? "border-violet-200 bg-violet-50"
                  : x.tone === "emerald"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <CardContent className="p-4">
                <Typography
                  className={`text-xs ${
                    x.tone === "slate"
                      ? "text-slate-500"
                      : x.tone === "amber"
                      ? "text-amber-700"
                      : x.tone === "sky"
                      ? "text-sky-700"
                      : x.tone === "violet"
                      ? "text-violet-700"
                      : x.tone === "emerald"
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {x.label}
                </Typography>
                <Typography
                  className={`mt-1 text-2xl font-black ${
                    x.tone === "slate"
                      ? "text-slate-900"
                      : x.tone === "amber"
                      ? "text-amber-900"
                      : x.tone === "sky"
                      ? "text-sky-900"
                      : x.tone === "violet"
                      ? "text-violet-900"
                      : x.tone === "emerald"
                      ? "text-emerald-900"
                      : "text-rose-900"
                  }`}
                >
                  {x.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-4!">
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              className="items-stretch lg:items-center"
            >
              <TextField
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหา Ticket ID / ลูกค้า / โทร / เรื่อง / booking / tag..."
                fullWidth
                size="medium"
                sx={roundedFieldSX}
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2 text-slate-500">
                      <SearchRoundedIcon fontSize="medium" />
                    </Box>
                  ),
                }}
              />

              <TextField
                select
                label="สถานะ"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as TicketStatus | "all")
                }
                size="medium"
                sx={roundedFieldSX}
                className="min-w-44"
                InputProps={{
                  startAdornment: (
                    <Box className="mr-2 text-slate-500">
                      <FilterAltRoundedIcon fontSize="medium" />
                    </Box>
                  ),
                }}
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="new">ใหม่</MenuItem>
                <MenuItem value="open">กำลังดำเนินการ</MenuItem>
                <MenuItem value="waiting">รอลูกค้าตอบ</MenuItem>
                <MenuItem value="resolved">ปิดงานแล้ว</MenuItem>
                <MenuItem value="closed">ปิดถาวร</MenuItem>
              </TextField>

              <TextField
                select
                label="ช่องทาง"
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel | "all")}
                size="medium"
                sx={roundedFieldSX}
                className="min-w-44"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="line">LINE</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="phone">โทร</MenuItem>
                <MenuItem value="webform">Web form</MenuItem>
              </TextField>

              <TextField
                select
                label="Priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as Priority | "all")
                }
                size="medium"
                sx={roundedFieldSX}
                className="min-w-44"
              >
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="urgent">ด่วนมาก</MenuItem>
                <MenuItem value="high">ด่วน</MenuItem>
                <MenuItem value="normal">ปกติ</MenuItem>
                <MenuItem value="low">ต่ำ</MenuItem>
              </TextField>

              <TextField
                select
                label="Owner"
                value={owner}
                onChange={(e) =>
                  setOwner(e.target.value as (typeof ADMINS)[number])
                }
                size="medium"
                sx={roundedFieldSX}
                className="min-w-44"
              >
                {ADMINS.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          className="rounded-2xl! border border-slate-200 bg-white"
        >
          <CardContent className="p-0">
            <Box className="grid">
              {filtered.map((t, idx) => {
                const due = dueBadge(t.dueAt);

                return (
                  <Box key={t.id}>
                    <Box className="p-4 sm:p-5">
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        className="items-start justify-between"
                      >
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                          className="min-w-0 flex-1 w-full"
                        >
                          <Box
                            className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                            sx={{
                              width: {
                                xs: "100%",
                                md: 220,
                                lg: 260,
                              },
                              height: {
                                xs: 150,
                                sm: 180,
                                md: 150,
                                lg: 170,
                              },
                            }}
                          >
                            <Box className="grid h-full w-full place-items-center bg-linear-to-br from-slate-100 to-slate-200 text-slate-500">
                              <ForumRoundedIcon sx={{ fontSize: 42 }} />
                            </Box>
                          </Box>

                          <Box className="min-w-0 flex-1">
                            <Stack
                              direction="row"
                              spacing={1.5}
                              className="items-center flex-wrap"
                            >
                              <Typography className="text-sm font-extrabold text-slate-900 tracking-wide">
                                {t.id}
                              </Typography>

                              <Chip
                                size="medium"
                                label={statusLabel(t.status)}
                                variant="outlined"
                                sx={{
                                  ...statusChipSX(t.status),
                                  height: 28,
                                  fontSize: 12,
                                  fontWeight: 900,
                                }}
                              />

                              <Chip
                                size="medium"
                                label={`Priority: ${priorityLabel(t.priority)}`}
                                variant="outlined"
                                sx={{
                                  ...priorityChipSX(t.priority),
                                  height: 28,
                                  fontSize: 12,
                                  fontWeight: 900,
                                }}
                              />

                              <Chip
                                size="medium"
                                label={channelLabel(t.channel)}
                                variant="outlined"
                              />
                              <Chip
                                size="medium"
                                label={branchLabel(t.branch)}
                                variant="outlined"
                              />

                              {t.owner ? (
                                <Chip
                                  size="medium"
                                  label={`Owner: ${t.owner}`}
                                  variant="outlined"
                                />
                              ) : (
                                <Chip
                                  size="medium"
                                  label="Unassigned"
                                  variant="outlined"
                                />
                              )}

                              {t.bookingId ? (
                                <Chip
                                  size="medium"
                                  icon={
                                    <EventNoteRoundedIcon fontSize="small" />
                                  }
                                  label={`Booking: ${t.bookingId}`}
                                  variant="outlined"
                                />
                              ) : null}

                              {due ? (
                                <Chip
                                  size="medium"
                                  icon={
                                    <ScheduleRoundedIcon fontSize="small" />
                                  }
                                  label={due.label}
                                  variant="outlined"
                                  sx={{
                                    height: 28,
                                    fontSize: 12,
                                    fontWeight: 900,
                                    ...(due.tone === "rose"
                                      ? {
                                          border: "1px solid rgb(254 202 202)",
                                          bgcolor: "rgb(254 226 226)",
                                          color: "rgb(153 27 27)",
                                        }
                                      : due.tone === "amber"
                                      ? {
                                          border: "1px solid rgb(253 230 138)",
                                          bgcolor: "rgb(254 243 199)",
                                          color: "rgb(146 64 14)",
                                        }
                                      : {
                                          border: "1px solid rgb(226 232 240)",
                                          bgcolor: "rgb(248 250 252)",
                                          color: "rgb(51 65 85)",
                                        }),
                                  }}
                                />
                              ) : null}
                            </Stack>

                            <Typography className="mt-1 text-lg font-bold text-slate-800">
                              {t.subject}
                            </Typography>

                            <Divider className="my-2! border-slate-200!" />

                            <Typography className="text-xs text-slate-500">
                              ลูกค้า:{" "}
                              <span className="font-medium text-slate-700">
                                {t.customerName}
                              </span>
                              {t.phone ? (
                                <>
                                  {" • "}โทร:{" "}
                                  <span className="font-medium text-slate-700">
                                    {t.phone}
                                  </span>
                                </>
                              ) : null}
                            </Typography>

                            <Typography className="mt-1 text-xs text-slate-500">
                              อัปเดตล่าสุด{" "}
                              <span className="font-medium text-slate-700">
                                {formatDateTimeTH(t.updatedAt)}
                              </span>
                            </Typography>

                            <Typography className="mt-2 text-sm text-slate-600 line-clamp-2">
                              {t.lastMessage}
                            </Typography>

                            {t.tags.length ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                className="items-center flex-wrap mt-2"
                              >
                                {t.tags.slice(0, 4).map((tag) => (
                                  <Chip
                                    key={tag}
                                    size="medium"
                                    icon={<LabelRoundedIcon fontSize="small" />}
                                    label={tag}
                                    variant="outlined"
                                  />
                                ))}
                                {t.tags.length > 4 ? (
                                  <Chip
                                    size="medium"
                                    label={`+${t.tags.length - 4}`}
                                    variant="outlined"
                                  />
                                ) : null}
                              </Stack>
                            ) : null}
                          </Box>
                        </Stack>

                        <Stack
                          spacing={1.5}
                          className="w-full md:w-auto"
                          sx={{
                            minWidth: { md: 220 },
                          }}
                        >
                          <Box className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <Typography className="text-xs text-slate-500">
                              ผู้รับผิดชอบ
                            </Typography>
                            <Typography className="text-sm font-semibold text-slate-900">
                              {t.owner ?? "Unassigned"}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={1}
                            className="justify-end flex-wrap"
                          >
                            <Tooltip title="โทร">
                              <span>
                                <IconButton
                                  component="a"
                                  href={toTelHref(t.phone)}
                                  disabled={!t.phone}
                                >
                                  <CallRoundedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="เปิดแชท (จำลอง)">
                              <IconButton
                                component="a"
                                href={toChatHref(t.channel, t)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ChatRoundedIcon />
                              </IconButton>
                            </Tooltip>

                            <Button
                              size="medium"
                              variant="contained"
                              onClick={() => setOpenId(t.id)}
                              endIcon={<OpenInNewRoundedIcon />}
                              className="rounded-lg!"
                              sx={{
                                textTransform: "none",
                                bgcolor: "rgb(15 23 42)",
                                boxShadow: "none",
                                "&:hover": {
                                  bgcolor: "rgb(2 6 23)",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              เปิด Ticket
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Box>

                    {idx !== filtered.length - 1 ? (
                      <Divider className="border-slate-200!" />
                    ) : null}
                  </Box>
                );
              })}

              {filtered.length === 0 ? (
                <Box className="p-8 text-center">
                  <Typography className="text-sm text-slate-600">
                    ไม่พบรายการที่ตรงกับเงื่อนไข
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={!!openId}
        onClose={() => setOpenId(null)}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 760,
            height: isMobile ? "88%" : "100%",
            borderTopLeftRadius: isMobile ? 18 : 0,
            borderTopRightRadius: isMobile ? 18 : 0,
            overflow: "hidden",
            bgcolor: "rgb(248 250 252)",
          },
        }}
      >
        <Box className="flex h-full flex-col">
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              borderBottom: "1px solid rgb(226 232 240)",
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isMobile ? (
              <Box className="flex justify-center pt-2">
                <Box className="h-1.5 w-12 rounded-full bg-slate-300" />
              </Box>
            ) : null}

            <Box className="px-4 py-3">
              <Stack
                direction="row"
                spacing={1.5}
                className="items-center justify-between"
              >
                <Stack
                  direction="row"
                  spacing={1.25}
                  className="items-center min-w-0"
                >
                  <Box
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200"
                    sx={{
                      bgcolor: "rgb(241 245 249)",
                      color: "rgb(15 23 42)",
                    }}
                  >
                    <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>

                  <Box className="min-w-0">
                    <Typography className="truncate text-sm font-black text-slate-900">
                      รายละเอียด Ticket
                    </Typography>
                    <Typography className="truncate text-xs text-slate-500">
                      {selected
                        ? `${selected.id} • ${selected.customerName}`
                        : "-"}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton
                  onClick={() => setOpenId(null)}
                  sx={{
                    border: "1px solid rgb(226 232 240)",
                    bgcolor: "white",
                    "&:hover": {
                      bgcolor: "rgb(248 250 252)",
                    },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>

          <Box className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {selected ? (
              <Stack spacing={2}>
                <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <Box
                    className="relative bg-linear-to-br from-slate-900 to-slate-700"
                    sx={{ minHeight: 220 }}
                  >
                    <Box className="grid h-55 w-full place-items-center text-slate-300">
                      <SupportAgentRoundedIcon sx={{ fontSize: 56 }} />
                    </Box>

                    <Box
                      className="absolute inset-0"
                      sx={{
                        background:
                          "linear-gradient(to bottom, rgba(15,23,42,0.82), rgba(15,23,42,0.18))",
                      }}
                    />

                    <Box className="absolute inset-x-0 top-0 p-4 text-white">
                      <Typography className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                        Ticket Overview
                      </Typography>
                      <Typography className="mt-2 text-xl font-extrabold">
                        {selected.subject}
                      </Typography>
                      <Typography className="mt-2 text-sm text-slate-200">
                        {channelLabel(selected.channel)} •{" "}
                        {branchLabel(selected.branch)}
                      </Typography>
                      <Typography className="mt-4 text-sm text-slate-300">
                        อัปเดตล่าสุด
                      </Typography>
                      <Typography className="text-2xl font-extrabold">
                        {formatDateTimeTH(selected.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <SectionCard title="จัดการ Ticket">
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <TextField
                      select
                      label="สถานะ"
                      size="medium"
                      value={selected.status}
                      onChange={(e) =>
                        updateTicket(selected.id, {
                          status: e.target.value as TicketStatus,
                        })
                      }
                      sx={{ flex: 1, ...roundedFieldSX }}
                      InputProps={{
                        startAdornment: (
                          <Box className="mr-2 text-slate-500">
                            <HourglassTopRoundedIcon fontSize="medium" />
                          </Box>
                        ),
                      }}
                    >
                      <MenuItem value="new">ใหม่</MenuItem>
                      <MenuItem value="open">กำลังดำเนินการ</MenuItem>
                      <MenuItem value="waiting">รอลูกค้าตอบ</MenuItem>
                      <MenuItem value="resolved">ปิดงานแล้ว</MenuItem>
                      <MenuItem value="closed">ปิดถาวร</MenuItem>
                    </TextField>

                    <TextField
                      select
                      label="Owner"
                      size="medium"
                      value={selected.owner ?? "Unassigned"}
                      onChange={(e) =>
                        updateTicket(selected.id, {
                          owner:
                            e.target.value === "Unassigned"
                              ? null
                              : (e.target.value as string),
                        })
                      }
                      sx={{ flex: 1, ...roundedFieldSX }}
                      InputProps={{
                        startAdornment: (
                          <Box className="mr-2 text-slate-500">
                            <AssignmentIndRoundedIcon fontSize="medium" />
                          </Box>
                        ),
                      }}
                    >
                      {ADMINS.map((a) => (
                        <MenuItem key={a} value={a}>
                          {a}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <TextField
                    select
                    label="Priority"
                    size="medium"
                    value={selected.priority}
                    onChange={(e) =>
                      updateTicket(selected.id, {
                        priority: e.target.value as Priority,
                      })
                    }
                    sx={roundedFieldSX}
                    InputProps={{
                      startAdornment: (
                        <Box className="mr-2 text-slate-500">
                          <LocalOfferRoundedIcon fontSize="medium" />
                        </Box>
                      ),
                    }}
                  >
                    <MenuItem value="urgent">ด่วนมาก</MenuItem>
                    <MenuItem value="high">ด่วน</MenuItem>
                    <MenuItem value="normal">ปกติ</MenuItem>
                    <MenuItem value="low">ต่ำ</MenuItem>
                  </TextField>

                  <Stack direction="row" spacing={1} className="flex-wrap">
                    <Button
                      size="medium"
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={() => copySummary(selected)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        borderColor: "rgb(226 232 240)",
                      }}
                    >
                      คัดลอกสรุป
                    </Button>

                    {selected.bookingId ? (
                      <Button
                        component={Link}
                        href={`/admin/bookings/${selected.bookingId}`}
                        size="medium"
                        variant="outlined"
                        endIcon={<OpenInNewRoundedIcon />}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2.5,
                          borderColor: "rgb(226 232 240)",
                        }}
                      >
                        เปิด Booking
                      </Button>
                    ) : null}
                  </Stack>
                </SectionCard>

                <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SectionCard title="ข้อมูลลูกค้า">
                    <InfoRow label="ชื่อ" value={selected.customerName} />
                    <InfoRow label="เบอร์โทร" value={selected.phone ?? "-"} />
                    <InfoRow
                      label="ช่องทาง"
                      value={channelLabel(selected.channel)}
                    />
                    <InfoRow
                      label="สาขา"
                      value={branchLabel(selected.branch)}
                    />
                  </SectionCard>

                  <SectionCard title="ข้อมูล Ticket">
                    <InfoRow
                      label="สถานะ"
                      value={
                        <Chip
                          size="medium"
                          label={statusLabel(selected.status)}
                          variant="outlined"
                          sx={statusChipSX(selected.status)}
                        />
                      }
                    />
                    <InfoRow
                      label="Priority"
                      value={
                        <Chip
                          size="medium"
                          label={priorityLabel(selected.priority)}
                          variant="outlined"
                          sx={priorityChipSX(selected.priority)}
                        />
                      }
                    />
                    <InfoRow
                      label="Owner"
                      value={selected.owner ?? "Unassigned"}
                    />
                    <InfoRow
                      label="Booking"
                      value={selected.bookingId ?? "-"}
                    />
                  </SectionCard>
                </Box>

                <SectionCard title="บทสนทนา">
                  <Box className="grid gap-2">
                    {selected.messages.map((m) => (
                      <Box
                        key={m.id}
                        className={[
                          "rounded-2xl border p-3",
                          m.from === "customer"
                            ? "border-slate-200 bg-white"
                            : m.from === "agent"
                            ? "border-slate-200 bg-slate-50"
                            : "border-slate-200 bg-slate-100",
                        ].join(" ")}
                      >
                        <Stack
                          direction="row"
                          className="items-center justify-between"
                        >
                          <Typography className="text-xs font-semibold text-slate-700">
                            {m.from === "customer"
                              ? "ลูกค้า"
                              : m.from === "agent"
                              ? "แอดมิน"
                              : "ระบบ"}
                          </Typography>
                          <Typography className="text-[11px] text-slate-500">
                            {formatDateTimeTH(m.at)}
                          </Typography>
                        </Stack>

                        <Typography className="mt-1 text-sm text-slate-900 whitespace-pre-line">
                          {m.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Card
                    elevation={0}
                    className="rounded-2xl! border border-slate-200 bg-white"
                  >
                    <CardContent className="p-4">
                      <Stack spacing={1.25}>
                        <TextField
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="พิมพ์ข้อความตอบลูกค้า..."
                          multiline
                          minRows={3}
                          size="medium"
                          sx={roundedFieldSX}
                        />

                        <Stack
                          direction="row"
                          spacing={1}
                          className="items-center justify-between"
                        >
                          <Typography className="text-[11px] text-slate-500 flex items-center gap-1">
                            <SendRoundedIcon fontSize="inherit" />
                            ส่งแบบจำลอง (ยังไม่ต่อ API จริง)
                          </Typography>

                          <Button
                            onClick={sendReply}
                            variant="contained"
                            size="medium"
                            endIcon={<SendRoundedIcon />}
                            sx={{
                              textTransform: "none",
                              bgcolor: "rgb(15 23 42)",
                              boxShadow: "none",
                              "&:hover": {
                                bgcolor: "rgb(2 6 23)",
                                boxShadow: "none",
                              },
                              borderRadius: 2.5,
                            }}
                          >
                            ส่งข้อความ
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </SectionCard>

                <SectionCard title="โน้ตภายใน">
                  <TextField
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เขียนโน้ตภายใน (ไม่ส่งให้ลูกค้า)..."
                    multiline
                    minRows={2}
                    size="medium"
                    sx={roundedFieldSX}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                    className="items-center justify-between"
                  >
                    <Typography className="text-[11px] text-slate-500 flex items-center gap-1">
                      <NotesRoundedIcon fontSize="inherit" />
                      ใช้เพื่อสรุปเคส / สิ่งที่ต้องทำต่อ
                    </Typography>

                    <Button
                      onClick={addInternalNote}
                      variant="outlined"
                      size="medium"
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        borderColor: "rgb(226 232 240)",
                      }}
                    >
                      บันทึกโน้ต
                    </Button>
                  </Stack>

                  {(selected.internalNotes?.length ?? 0) > 0 ? (
                    <Box className="grid gap-2">
                      {selected.internalNotes.slice(0, 6).map((n, i) => (
                        <Box
                          key={i}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <Typography className="text-sm text-slate-900 whitespace-pre-line">
                            {n}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography className="text-xs text-slate-500">
                      ยังไม่มีโน้ตภายใน
                    </Typography>
                  )}
                </SectionCard>

                <SectionCard title="การดำเนินการ">
                  <Stack spacing={1}>
                    <Button
                      component="a"
                      href={toChatHref(selected.channel, selected)}
                      target="_blank"
                      rel="noreferrer"
                      variant="contained"
                      startIcon={<ChatRoundedIcon />}
                      sx={{
                        textTransform: "none",
                        bgcolor: "rgb(15 23 42)",
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: "rgb(2 6 23)",
                          boxShadow: "none",
                        },
                        borderRadius: 2.5,
                      }}
                    >
                      เปิดแชทภายนอก (จำลอง)
                    </Button>

                    <Button
                      component="a"
                      href={toTelHref(selected.phone)}
                      variant="outlined"
                      startIcon={<CallRoundedIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2.5,
                        borderColor: "rgb(226 232 240)",
                      }}
                      disabled={!selected.phone}
                    >
                      โทรหาลูกค้า
                    </Button>

                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => deleteTicket(selected.id)}
                      sx={{ textTransform: "none", borderRadius: 2.5 }}
                    >
                      ลบ Ticket (จำลอง)
                    </Button>

                    <Typography className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <ScheduleRoundedIcon fontSize="inherit" />* ต่อ API ได้:
                      inbound messages, SLA/due, owner permissions, canned
                      replies, attachments
                    </Typography>
                  </Stack>
                </SectionCard>
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: 24 }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
