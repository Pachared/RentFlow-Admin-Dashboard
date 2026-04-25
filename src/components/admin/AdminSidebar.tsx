"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import { ADMIN_NAV } from "./adminNav";
import type { AdminNavGroup } from "./adminNav";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  drawerWidth?: number;
};

const GROUP_LABEL: Record<AdminNavGroup, string> = {
  Operations: "งานปฏิบัติการ",
  Sales: "งานขาย / ลูกค้า",
  Finance: "การเงิน",
  Analytics: "รายงานและวิเคราะห์",
  Administration: "ผู้ดูแลระบบ",
};

const GROUPS: AdminNavGroup[] = [
  "Operations",
  "Sales",
  "Finance",
  "Analytics",
  "Administration",
];

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
  drawerWidth = 280,
}: Props) {
  const pathname = usePathname();

  const content = (
    <Box
      className="h-full bg-white"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Box className="p-2 sm:p-2.5 md:p-3 lg:p-3" sx={{ flex: "0 0 auto" }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box className="grid h-10 w-10 place-items-center rounded-lg! border border-slate-200 bg-slate-50">
            <DirectionsCarRoundedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography className="text-sm font-extrabold text-slate-900">
              RentFlow Admin
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider className="border-slate-200!" />

      <Box
        className="px-2 py-3"
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",

          "&::-webkit-scrollbar": { width: 10 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "transparent",
            borderRadius: 999,
            border: "3px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-button": {
            display: "none",
            height: 0,
            width: 0,
          },

          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "rgb(203 213 225)",
          },
        }}
      >
        {GROUPS.map((group, index) => {
          const items = ADMIN_NAV.filter((x) => x.group === group);
          if (!items.length) return null;

          return (
            <Box
              key={group}
              sx={{
                mb: 1,
                ...(index !== 0 && {
                  borderTop: "1px solid rgb(226 232 240)",
                }),
              }}
            >
              <Typography className="px-2 pb-2 pt-3 text-[11px] font-semibold tracking-wide text-slate-500">
                {GROUP_LABEL[group]}
              </Typography>

              <List
                dense={false}
                disablePadding
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                  const iconColor = item.color ?? "#64748B";

                  return (
                    <ListItemButton
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={onMobileClose}
                      className="mx-1 rounded-xl"
                      sx={{
                        borderRadius: 3,
                        minHeight: { xs: 54, sm: 50, md: 46 },
                        px: { xs: 2.5, md: 2 },
                        py: { xs: 1.4, md: 1.1 },
                        bgcolor: active ? "rgb(241 245 249)" : "transparent",
                        border: active
                          ? "1px solid rgb(203 213 225)"
                          : "1px solid transparent",
                        "&:hover": {
                          backgroundColor: active
                            ? "rgb(241 245 249)"
                            : "rgb(248 250 252)",
                          border: "1px solid rgb(203 213 225)",
                        },
                        transition: "background-color 150ms ease, border 150ms ease",
                      }}
                      selected={active}
                    >
                      <ListItemIcon
                        sx={{ minWidth: { xs: 48, md: 44 }, color: "inherit" }}
                      >
                        <Icon
                          sx={{
                            fontSize: { xs: 24, md: 22 },
                            color: iconColor,
                            opacity: active ? 1 : 0.7,

                            transition: "opacity 150ms ease",
                            ".MuiListItemButton-root:hover &": { opacity: 1 },
                          }}
                        />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize: { xs: 17, md: 15.5 },
                              fontWeight: 500,
                              lineHeight: 1.3,
                              letterSpacing: 0.2,
                              color: "rgb(30 41 59)",
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
    </Box>
  );

  const paperSx = {
    width: drawerWidth,
    borderRight: "1px solid rgb(226 232 240)",
    bgcolor: "#fff",
  } as const;

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            ...paperSx,
          },
        }}
      >
        {content}
      </Drawer>

      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            ...paperSx,
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
