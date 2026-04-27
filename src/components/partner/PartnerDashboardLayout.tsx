"use client";

import * as React from "react";
import { Box, Container } from "@mui/material";
import PartnerSidebar from "./PartnerSidebar";
import PartnerTopbar from "./PartnerTopbar";
import FloatingAiLauncher from "./FloatingAiLauncher";

type Props = {
  children: React.ReactNode;
  drawerWidth?: number;
};

export default function PartnerDashboardLayout({
  children,
  drawerWidth = 296,
}: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return (
    <Box className="relative min-h-screen overflow-hidden bg-[var(--rf-partner-bg)] text-slate-950">
      <PartnerTopbar onOpenMobile={openMobile} drawerWidth={drawerWidth} />
      <PartnerSidebar
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        drawerWidth={drawerWidth}
      />

      <Box
        component="main"
        sx={{
          ml: { md: `${drawerWidth}px` },
          pt: { xs: "88px", md: "92px" },
        }}
      >
        <Container
          maxWidth={false}
          className="partner-content-container py-6 md:py-8"
        >
          {children}
        </Container>
      </Box>

      <FloatingAiLauncher />
    </Box>
  );
}
