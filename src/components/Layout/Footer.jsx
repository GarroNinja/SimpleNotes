import React from "react";
import { Box, Typography, Link, useTheme } from "@mui/material";

function Footer() {
  const year = new Date().getFullYear();
  const theme = useTheme();

  return (
    <Box
      component="footer"
      className="footer"
      sx={{
        mt: 5,
        py: 3,
        textAlign: "center",
        position: "relative",
        bottom: 0,
        width: "100%",
        color: theme.palette.text.secondary,
      }}
    >
      <Typography variant="body2">
        Copyright © {year}{" "}
        <Link 
          href="#" 
          color="primary" 
          sx={{ textDecoration: "none" }}
        >
          SimpleNotes
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer; 