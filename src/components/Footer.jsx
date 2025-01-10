import React from "react";
import { Box, Typography, Link } from "@mui/material";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 5,
        py: 3,
        textAlign: "center",
        position: "relative",
        bottom: 0,
        width: "100%",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Copyright © {year}{" "}
        <Link 
          href="https://github.com/GarroNinja/SimpleNotes" 
          color="inherit" 
          target="_blank"
          rel="noopener"
        >
          SimpleNotes
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer;