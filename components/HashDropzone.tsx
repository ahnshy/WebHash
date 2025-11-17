"use client";

import * as React from "react";
import CryptoJS from "crypto-js";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { Theme } from "@mui/material/styles";

type HashStatus = "pending" | "hashing" | "done" | "error";

interface FileHash {
  id: string;
  file: File;
  status: HashStatus;
  md5?: string;
  sha1?: string;
  sha256?: string;
  sha512?: string;
  error?: string;
}

export default function HashDropzone() {
  const [items, setItems] = React.useState<FileHash[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  // toast
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: FileHash[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      file,
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const { files } = event.dataTransfer;
    handleFiles(files);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const clearAll = () => setItems([]);

  React.useEffect(() => {
    const next = items.find((i) => i.status === "pending");
    if (!next) return;

    const computeHashes = async (target: FileHash) => {
      setItems((prev) =>
          prev.map((i) =>
              i.id === target.id ? { ...i, status: "hashing" } : i
          )
      );

      try {
        const buffer = await readFileAsArrayBuffer(target.file);
        const wordArray = CryptoJS.lib.WordArray.create(buffer as any);

        const md5 = CryptoJS.MD5(wordArray).toString();
        const sha1 = CryptoJS.SHA1(wordArray).toString();
        const sha256 = CryptoJS.SHA256(wordArray).toString();
        const sha512 = CryptoJS.SHA512(wordArray).toString();

        setItems((prev) =>
            prev.map((i) =>
                i.id === target.id
                    ? { ...i, status: "done", md5, sha1, sha256, sha512 }
                    : i
            )
        );
      } catch (err: any) {
        setItems((prev) =>
            prev.map((i) =>
                i.id === target.id
                    ? {
                      ...i,
                      status: "error",
                      error: err?.message ?? "Failed to compute hashes",
                    }
                    : i
            )
        );
      }
    };

    computeHashes(next);
  }, [items]);

  const hasItems = items.length > 0;
  const isBusy = items.some(
      (i) => i.status === "pending" || i.status === "hashing"
  );

  const handleExport = () => {
    if (!items.length) return;
    const lines = [
      "filename,size_bytes,md5,sha1,sha256,sha512",
      ...items
          .filter((i) => i.status === "done")
          .map((i) =>
              [
                `"${i.file.name.replace(/"/g, '""')}"`,
                i.file.size,
                i.md5 ?? "",
                i.sha1 ?? "",
                i.sha256 ?? "",
                i.sha512 ?? "",
              ].join(",")
          ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "webhash-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCopyHash = async (label: string, value?: string | null) => {
    if (!value) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      showSnackbar(`${label} hash copied to clipboard`);
    } catch {
      showSnackbar(`Failed to copy ${label} hash`);
    }
  };

  const handleSnackbarClose = (
      _event?: React.SyntheticEvent | Event,
      reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const hashCellSx = (theme: Theme) => ({
    fontFamily: "monospace",
    fontSize: "0.75rem",
    maxWidth: 260,
    overflowWrap: "anywhere",
    cursor: "pointer",
    userSelect: "text",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  });

  return (
      <>
        <Stack spacing={3}>
          <Paper
              elevation={0}
              sx={(theme: Theme) => ({
                borderRadius: 16,
                border: `1px dashed ${theme.palette.divider}`,
                padding: theme.spacing(4),
                textAlign: "center",
                cursor: "pointer",
                background: "transparent",
                transition:
                    "border-color 150ms ease, background-color 150ms ease, transform 150ms ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover,
                },
                ...(isDragging && {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.hover,
                  transform: "scale(0.99)",
                }),
              })}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onClick={handleBrowseClick}
          >
            <Stack spacing={2} alignItems="center">
              <UploadFileIcon fontSize="large" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Drop files here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or click to choose one or more files
                </Typography>
              </Box>
              <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
              >
                Browse files
              </Button>
              <Typography variant="caption" color="text.secondary">
                Files are processed locally in your browser. No data is sent to a
                server.
              </Typography>
            </Stack>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(event) => handleFiles(event.target.files)}
            />
          </Paper>

          {hasItems && (
              <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="flex-end"
                  alignItems="center"
              >
                {isBusy && (
                    <Chip
                        size="small"
                        icon={<CircularProgress size={14} />}
                        label="Hashing in progress..."
                        variant="outlined"
                    />
                )}
                <Tooltip title="Export results as CSV">
              <span>
                <IconButton
                    onClick={handleExport}
                    disabled={!items.some((i) => i.status === "done")}
                >
                  <FileDownloadIcon />
                </IconButton>
              </span>
                </Tooltip>
                <Tooltip title="Clear all">
                  <IconButton onClick={clearAll}>
                    <DeleteSweepIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
          )}

          {hasItems && (
              <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ maxHeight: 420 }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>File</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>Size</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>MD5</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>SHA-1</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>SHA-256</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>SHA-512</TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Stack spacing={0.3}>
                              <Typography
                                  variant="body2"
                                  sx={{ wordBreak: "break-all" }}
                              >
                                {item.file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(item.file.size / 1024).toFixed(1)} KB
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{item.file.size.toLocaleString()}</TableCell>

                          <TableCell
                              sx={hashCellSx}
                              onClick={() => handleCopyHash("MD5", item.md5)}
                          >
                            {item.md5}
                          </TableCell>
                          <TableCell
                              sx={hashCellSx}
                              onClick={() => handleCopyHash("SHA-1", item.sha1)}
                          >
                            {item.sha1}
                          </TableCell>
                          <TableCell
                              sx={hashCellSx}
                              onClick={() => handleCopyHash("SHA-256", item.sha256)}
                          >
                            {item.sha256}
                          </TableCell>
                          <TableCell
                              sx={hashCellSx}
                              onClick={() => handleCopyHash("SHA-512", item.sha512)}
                          >
                            {item.sha512}
                          </TableCell>

                          <TableCell align="center">
                            {item.status === "hashing" && (
                                <CircularProgress size={20} />
                            )}
                            {item.status === "pending" && (
                                <Typography variant="caption" color="text.secondary">
                                  queued
                                </Typography>
                            )}
                            {item.status === "done" && (
                                <Typography variant="caption" color="success.main">
                                  done
                                </Typography>
                            )}
                            {item.status === "error" && (
                                <Tooltip title={item.error ?? "Error"}>
                                  <IconButton size="small" color="error">
                                    <InfoOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
          )}
        </Stack>

        <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </>
  );
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error("File reading aborted"));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Unexpected result type"));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
