"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

function AiSparkle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      width="34"
      height="34"
      className="block"
    >
      <defs>
        <linearGradient id="partner-ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="38%" stopColor="#22c55e" />
          <stop offset="70%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        fill="url(#partner-ai-gradient)"
        d="M30.6 5.2c1.1-2.4 4.7-2.4 5.8 0l5.2 11.4c.3.8.9 1.4 1.7 1.7l11.4 5.2c2.4 1.1 2.4 4.7 0 5.8l-11.4 5.2c-.8.3-1.4.9-1.7 1.7l-5.2 11.4c-1.1 2.4-4.7 2.4-5.8 0l-5.2-11.4c-.3-.8-.9-1.4-1.7-1.7L12.3 29.3c-2.4-1.1-2.4-4.7 0-5.8l11.4-5.2c.8-.3 1.4-.9 1.7-1.7l5.2-11.4Z"
      />
      <path
        fill="url(#partner-ai-gradient)"
        d="M12.7 41.3c.8-1.8 3.5-1.8 4.3 0l1.8 4c.3.6.7 1 1.3 1.3l4 1.8c1.8.8 1.8 3.5 0 4.3l-4 1.8c-.6.3-1 .7-1.3 1.3l-1.8 4c-.8 1.8-3.5 1.8-4.3 0l-1.8-4c-.3-.6-.7-1-1.3-1.3l-4-1.8c-1.8-.8-1.8-3.5 0-4.3l4-1.8c.6-.3 1-.7 1.3-1.3l1.8-4Z"
      />
    </svg>
  );
}

export default function FloatingAiLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const [showHint, setShowHint] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  if (pathname === "/login") return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 18, md: 28 },
        bottom: { xs: 18, md: 28 },
        zIndex: 1200,
        pointerEvents: "none",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          className="partner-floating-hint"
          sx={{
            opacity: showHint ? 1 : 0,
            transform: showHint ? "translateX(0)" : "translateX(10px)",
            transition: "opacity 420ms ease, transform 420ms ease",
            pointerEvents: "none",
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography className="text-xs font-bold text-slate-950">
            ผู้ช่วยร้าน
          </Typography>
          <Typography className="text-[11px] text-slate-500">
            วิเคราะห์ยอดจอง รถ และงานที่ควรทำต่อ
          </Typography>
        </Box>

        <Button
          aria-label="เปิดผู้ช่วยอัจฉริยะ"
          onClick={() => router.push("/partner/ai")}
          sx={{
            pointerEvents: "auto",
            minWidth: 0,
            width: { xs: 66, md: 74 },
            height: { xs: 66, md: 74 },
            borderRadius: "999px",
            bgcolor: "rgb(18 18 22)",
            color: "white",
            boxShadow:
              "0 28px 60px rgba(15,23,42,0.28), 0 10px 24px rgba(15,23,42,0.16)",
            border: "1px solid rgba(255,255,255,0.28)",
            "&:hover": {
              bgcolor: "rgb(18 18 22)",
              transform: "scale(1.035)",
              boxShadow:
                "0 34px 72px rgba(15,23,42,0.32), 0 14px 30px rgba(15,23,42,0.18)",
            },
            transition:
              "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <AiSparkle />
        </Button>
      </Stack>
    </Box>
  );
}
