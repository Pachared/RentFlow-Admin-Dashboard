"use client";

import * as React from "react";
import { Box, Container } from "@mui/material";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

type Props = {
    children: React.ReactNode;
    drawerWidth?: number;
};

export default function DashboardLayout({ children, drawerWidth = 280 }: Props) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const openMobile = () => setMobileOpen(true);
    const closeMobile = () => setMobileOpen(false);

    return (
        <Box className="min-h-screen bg-slate-50">
            <AdminTopbar onOpenMobile={openMobile} drawerWidth={drawerWidth} />
            <AdminSidebar
                mobileOpen={mobileOpen}
                onMobileClose={closeMobile}
                drawerWidth={drawerWidth}
            />

            <Box
                component="main"
                sx={{
                    ml: { md: `${drawerWidth}px` },
                    pt: "64px",
                }}
            >
                <Container maxWidth="lg" className="py-6">
                    {children}
                </Container>
            </Box>
        </Box>
    );
}