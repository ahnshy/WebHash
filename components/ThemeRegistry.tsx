"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { createTheme, type PaletteMode, type ThemeOptions } from "@mui/material/styles";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

type Mode = "light" | "night" | "dark";

function getDesignTokens(mode: Mode): ThemeOptions {
  // MUI 입장에서는 light / dark 두 가지만 사용
  const paletteMode: PaletteMode = mode === "light" ? "light" : "dark";

  const common: ThemeOptions = {
    typography: {
      fontFamily: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "sans-serif",
      ].join(","),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          },
        },
      },
    },
  };

  if (mode === "light") {
    return {
      ...common,
      palette: {
        mode: paletteMode, // "light"
        primary: { main: "#1976d2" },
        secondary: { main: "#9c27b0" },
        background: {
          default: "#f5f5f7",
          paper: "#ffffff",
        },
      },
    };
  }

  if (mode === "dark") {
    return {
      ...common,
      palette: {
        mode: paletteMode, // "dark"
        primary: { main: "#90caf9" },
        secondary: { main: "#f48fb1" },
        background: {
          default: "#050816",
          paper: "#0b1020",
        },
      },
    };
  }

  // night theme (기본값) → 내부적으로는 dark 모드
  return {
    ...common,
    palette: {
      mode: paletteMode, // "dark"
      primary: { main: "#ffb74d" },
      secondary: { main: "#64b5f6" },
      background: {
        default: "#050b18",
        paper: "#0b1324",
      },
    },
  };
}

export default function ThemeRegistry({
                                        children,
                                      }: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<Mode>("night");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("webhash-theme") as Mode | null;
    if (stored === "light" || stored === "night" || stored === "dark") {
      setMode(stored);
    }
  }, []);

  const theme = React.useMemo(
      () => createTheme(getDesignTokens(mode)),
      [mode]
  );

  const handleModeChange = (
      _event: React.MouseEvent<HTMLElement>,
      value: Mode | null
  ) => {
    if (!value) return;
    setMode(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("webhash-theme", value);
    }
  };

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                  component="img"
                  src="/logo-bi-horizontal.svg"
                  alt="WebHash logo"
                  sx={{ height: 28, display: { xs: "none", sm: "block" } }}
              />
              <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    display: { xs: "block", sm: "none" },
                  }}
              >
                WebHash
              </Typography>
            </Box>
            <ToggleButtonGroup
                value={mode}
                exclusive
                size="small"
                onChange={handleModeChange}
                aria-label="theme mode"
            >
              <ToggleButton value="light" aria-label="light theme">
                <LightModeIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="night" aria-label="night theme">
                <NightsStayIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="dark" aria-label="dark theme">
                <DarkModeIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
        <Box
            sx={(t) => ({
              minHeight: "100vh",
              backgroundColor: t.palette.background.default,
            })}
        >
          {children}
        </Box>
      </ThemeProvider>
  );
}
