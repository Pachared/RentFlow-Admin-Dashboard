"use client";

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f172a",
    },
    secondary: {
      main: "#2563eb",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#667085",
    },
    success: {
      main: "#22c55e",
    },
    error: {
      main: "#f43f5e",
    },
  },
  typography: {
    fontFamily: "var(--font-thai), 'Noto Sans Thai', system-ui, sans-serif",
    h1: {
      fontSize: "clamp(2rem, 1.32rem + 2vw, 3.45rem)",
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: "-0.05em",
    },
    h2: {
      fontSize: "clamp(1.6rem, 1.18rem + 1vw, 2.5rem)",
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: "-0.045em",
    },
    h3: {
      fontSize: "clamp(1.32rem, 1.12rem + 0.55vw, 1.78rem)",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.035em",
    },
    h4: {
      fontSize: "clamp(1.18rem, 1.04rem + 0.45vw, 1.5rem)",
      fontWeight: 800,
      lineHeight: 1.15,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontSize: "clamp(1.05rem, 0.98rem + 0.18vw, 1.18rem)",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontSize: "clamp(1rem, 0.94rem + 0.16vw, 1.08rem)",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
    },
    body1: {
      fontSize: "clamp(0.96rem, 0.93rem + 0.12vw, 1.02rem)",
      lineHeight: 1.75,
    },
    body2: {
      fontSize: "clamp(0.88rem, 0.86rem + 0.08vw, 0.94rem)",
      lineHeight: 1.7,
    },
    button: {
      fontSize: "clamp(0.92rem, 0.9rem + 0.06vw, 0.98rem)",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#ffffff",
          fontFamily:
            "var(--font-thai), 'Noto Sans Thai', system-ui, sans-serif",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "clamp(1rem, 2vw, 1.5rem)",
          paddingRight: "clamp(1rem, 2vw, 1.5rem)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 30,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 46,
          boxShadow: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 22,
        },
        input: {
          fontSize: "clamp(0.92rem, 0.9rem + 0.08vw, 0.98rem)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
          minHeight: 46,
          border: 0,
          backgroundColor: "#eef1f5",
          color: "#667085",
        },
        label: {
          paddingLeft: 14,
          paddingRight: 14,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        icon: false,
      },
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
