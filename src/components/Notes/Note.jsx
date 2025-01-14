import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  IconButton, 
  Tooltip,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState(props.color || "#ffffff");
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const colorMenuOpen = Boolean(colorMenuAnchor);
  const [labels, setLabels] = useState(props.labels || []);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Adjust colors for dark mode
  const isDarkMode = props.darkMode;
  const adjustedColor = isDarkMode && color === "#ffffff" ? "#1e1e1e" : color;
  const textColor = isDarkMode ? 
                    (color === "#ffffff" ? "#ffffff" : determineTextColor(color)) : 
                    (color !== "#ffffff" ? determineTextColor(color) : "text.secondary");
  
  // Helper function to determine appropriate text color based on background color
  function determineTextColor(bgColor) {
    // For light colored backgrounds, use dark text
    if (["#ffffff", "#a7ffeb", "#cbf0f8", "#ccff90", "#fff475", "#fdcfe8"].includes(bgColor)) {
      return "rgba(0, 0, 0, 0.87)";
    }
    // For darker colored backgrounds, use light text
    return "rgba(255, 255, 255, 0.87)";
  }

  function handleDeleteClick() {
    setDeleteDialogOpen(true);
  }

  function handleDeleteConfirm() {
    props.onDelete(props.id);
    setDeleteDialogOpen(false);
  }

  function handleDeleteCancel() {
    setDeleteDialogOpen(false);
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

  function handleLabelDialogOpen() {
    setLabelDialogOpen(true);
  }

  function handleLabelDialogClose() {
    setLabelDialogOpen(false);
    setNewLabel("");
  }

  function handleAddLabel() {
    if (newLabel.trim() !== "" && !labels.includes(newLabel.trim())) {
      const updatedLabels = [...labels, newLabel.trim()];
      setLabels(updatedLabels);
      setNewLabel("");
      
      // If a prop function exists to update the parent component
      if (props.onLabelChange) {
        props.onLabelChange(props.id, updatedLabels);
      }
    }
  }

  function handleRemoveLabel(labelToRemove) {
    const updatedLabels = labels.filter(label => label !== labelToRemove);
    setLabels(updatedLabels);
    
    // If a prop function exists to update the parent component
    if (props.onLabelChange) {
      props.onLabelChange(props.id, updatedLabels);
    }
  }

  return (
    <>
      <Card 
        sx={{ 
          minWidth: 240, 
          maxWidth: { xs: '100%', sm: 345 }, 
          m: 1, 
          display: "inline-block", 
          backgroundColor: adjustedColor,
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
          <Typography 
            variant="h5" 
            component="div" 
            gutterBottom
            sx={{ 
              color: isDarkMode && color === "#ffffff" ? "#ffffff" : determineTextColor(color)
            }}
          >
            {props.title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              whiteSpace: "pre-wrap",
              color: textColor
            }}
          >
            {props.content}
          </Typography>
          
          {labels.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
              {labels.map((label, index) => (
                <Chip 
                  key={index} 
                  label={label} 
                  size="small" 
                  onDelete={() => handleRemoveLabel(label)}
                />
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions 
          sx={{ 
            display: isMobile ? "flex" : "none", 
            justifyContent: "flex-start",
            p: 1,
            "& .MuiCard-root:hover &": {
              display: "flex"
            }
          }}
        >
          <Tooltip title="Delete">
            <IconButton size="small" onClick={handleDeleteClick} aria-label="delete">
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
          <Tooltip title="Add label">
            <IconButton 
              size="small" 
              onClick={handleLabelDialogOpen} 
              aria-label="add label"
            >
              <LabelOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive">
            <IconButton size="small" onClick={handleArchive} aria-label="archive">
              <ArchiveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
        
        {/* Color menu */}
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
        
        {/* Label dialog */}
        <Dialog 
          open={labelDialogOpen} 
          onClose={handleLabelDialogClose}
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff'
            }
          }}
        >
          <DialogTitle sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Add a label</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="label"
              label="New label"
              type="text"
              fullWidth
              variant="standard"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddLabel();
                }
              }}
              InputProps={{
                style: { color: isDarkMode ? '#ffffff' : 'inherit' }
              }}
              InputLabelProps={{
                style: { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLabelDialogClose} sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Cancel</Button>
            <Button onClick={handleAddLabel} sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Add</Button>
          </DialogActions>
        </Dialog>
      </Card>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? '#1e1e1e' : '#ffffff'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>
          {"Delete this note?"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>
            This action cannot be undone. Are you sure you want to delete this note?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Note; 