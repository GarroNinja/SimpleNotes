import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import { Box, Menu, MenuItem } from "@mui/material";

const colors = [
  "#ffffff", // default
  "#f28b82", // red
  "#fbbc04", // orange
  "#fff475", // yellow
  "#ccff90", // green
  "#a7ffeb", // teal
  "#cbf0f8", // blue
  "#d7aefb", // purple
  "#fdcfe8", // pink
];

function Note(props) {
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const colorMenuOpen = Boolean(colorMenuAnchor);

  function handleDelete() {
    props.onDelete(props.id);
  }

  function handlePinClick() {
    setIsPinned(!isPinned);
    if (props.onPin) {
      props.onPin(props.id, !isPinned);
    }
  }

  function handleArchive() {
    if (props.onArchive) {
      props.onArchive(props.id);
    }
  }

  function handleColorMenuOpen(event) {
    setColorMenuAnchor(event.currentTarget);
  }

  function handleColorMenuClose() {
    setColorMenuAnchor(null);
  }

  function handleColorSelect(selectedColor) {
    setColor(selectedColor);
    handleColorMenuClose();
  }

  return (
    <Card 
      sx={{ 
        minWidth: 240, 
        maxWidth: 345, 
        m: 1, 
        display: "inline-block", 
        backgroundColor: color,
        boxShadow: 1,
        position: "relative",
        "&:hover": {
          boxShadow: 3,
          "& .MuiCardActions-root": {
            display: "flex"
          }
        }
      }}
    >
      <CardContent>
        <Box sx={{ position: "absolute", top: 5, right: 5 }}>
          <IconButton size="small" onClick={handlePinClick}>
            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </IconButton>
        </Box>
        <Typography variant="h5" component="div" gutterBottom>
          {props.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
          {props.content}
        </Typography>
      </CardContent>
      <CardActions 
        sx={{ 
          display: { xs: "flex", sm: "none" }, 
          justifyContent: "flex-start",
          p: 1
        }}
      >
        <Tooltip title="Delete">
          <IconButton size="small" onClick={handleDelete} aria-label="delete">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change color">
          <IconButton 
            size="small" 
            onClick={handleColorMenuOpen} 
            aria-label="change color"
            aria-controls={colorMenuOpen ? "color-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={colorMenuOpen ? "true" : undefined}
          >
            <ColorLensOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Archive">
          <IconButton size="small" onClick={handleArchive} aria-label="archive">
            <ArchiveOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
      <Menu
        id="color-menu"
        anchorEl={colorMenuAnchor}
        open={colorMenuOpen}
        onClose={handleColorMenuClose}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", width: 136, p: 0.5 }}>
          {colors.map((colorOption, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 40,
                m: 0.5,
                borderRadius: "50%",
                backgroundColor: colorOption,
                cursor: "pointer",
                border: color === colorOption ? "2px solid #000" : "1px solid #ddd",
              }}
              onClick={() => handleColorSelect(colorOption)}
            />
          ))}
        </Box>
      </Menu>
    </Card>
  );
}

export default Note;
