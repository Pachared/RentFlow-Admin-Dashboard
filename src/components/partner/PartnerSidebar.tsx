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
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { readStoreProfile, type PartnerStoreProfile } from "@/src/lib/partner-store";
import { PARTNER_NAV } from "./partnerNav";
import type { PartnerNavGroup } from "./partnerNav";

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
  drawerWidth?: number;
};

const GROUP_LABEL: Record<PartnerNavGroup, string> = {
  Operations: "งานปฏิบัติการ",
  Sales: "งานขายและลูกค้า",
  Finance: "การเงิน",
  Analytics: "รายงานและวิเคราะห์",
  Settings: "ตั้งค่าและช่วยเหลือ",
};

const GROUPS: PartnerNavGroup[] = [
  "Operations",
  "Sales",
  "Finance",
  "Analytics",
  "Settings",
];

export default function PartnerSidebar({
  mobileOpen,
  onMobileClose,
  drawerWidth = 296,
}: Props) {
  const pathname = usePathname();
  const [storeProfile, setStoreProfile] =
    React.useState<PartnerStoreProfile | null>(null);

  React.useEffect(() => {
    const syncStoreProfile = () => setStoreProfile(readStoreProfile());

    syncStoreProfile();
    window.addEventListener("storage", syncStoreProfile);
    window.addEventListener("rentflow-store-profile-updated", syncStoreProfile);

    return () => {
      window.removeEventListener("storage", syncStoreProfile);
      window.removeEventListener(
        "rentflow-store-profile-updated",
        syncStoreProfile
      );
    };
  }, []);

  const content = (
    <Box
      className="partner-shell h-full border-0"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Box className="p-4 md:p-5" sx={{ flex: "0 0 auto" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box className="grid h-11 w-11 place-items-center overflow-hidden rounded-[18px] bg-[var(--rf-partner-blue-deep)] text-sm font-black tracking-[-0.05em] text-white shadow-[0_18px_38px_rgba(15,23,42,0.2)]">
            {storeProfile?.logoUrl ? (
              <Box
                component="img"
                src={storeProfile.logoUrl}
                alt={storeProfile.shopName}
                className="h-full w-full object-cover"
              />
            ) : (
              "RF"
            )}
          </Box>
          <Box>
            <Typography className="text-base font-extrabold tracking-[-0.03em] text-slate-950">
              {storeProfile?.shopName || "ศูนย์จัดการร้าน"}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider className="border-white/60!" />

      <Box
        className="partner-scrollbar px-3 py-3"
        sx={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {GROUPS.map((group, index) => {
          const items = PARTNER_NAV.filter((x) => x.group === group);
          if (!items.length) return null;

          return (
            <Box
              key={group}
              sx={{
                mb: 1.25,
                ...(index !== 0 && { borderTop: 0 }),
              }}
            >
              <Typography
                className="px-2 pb-2 pt-3 text-[13px] tracking-[-0.035em] text-slate-600"
                sx={{ fontWeight: "900 !important" }}
              >
                {GROUP_LABEL[group]}
              </Typography>

              <List
                dense={false}
                disablePadding
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                }}
              >
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");

                  return (
                    <ListItemButton
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={onMobileClose}
                      className="mx-1 rounded-[22px]"
                      sx={{
                        borderRadius: "22px",
                        minHeight: { xs: 52, md: 48 },
                        px: 2.25,
                        py: 1.35,
                        bgcolor: active
                          ? "#eef1f5"
                          : "transparent",
                        border: 0,
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: "#eef1f5",
                          border: 0,
                          boxShadow: "none",
                        },
                        transition:
                          "background-color 180ms ease, box-shadow 180ms ease",
                      }}
                      selected={active}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize: { xs: 16.5, md: 15.2 },
                              fontWeight: "400 !important",
                              lineHeight: 1.3,
                              letterSpacing: "-0.02em",
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
    borderRight: 0,
    bgcolor: "#ffffff",
    boxShadow: "none",
  } as const;

  return (
    <>
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
