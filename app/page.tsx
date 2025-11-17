import { Box, Container, Typography } from "@mui/material";
import HashDropzone from "@/components/HashDropzone";

export default function HomePage() {
  return (
    <Container sx={{ py: 1 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" component="h1" align={"center"} gutterBottom>
          WebHash
        </Typography>
        {/*<Typography variant="body1" color="text.secondary">*/}
        {/*  Drag & drop one or more files or use the file picker to compute their*/}
        {/*  hash values directly in your browser.*/}
        {/*</Typography>*/}
      </Box>

      <HashDropzone />
    </Container>
  );
}
