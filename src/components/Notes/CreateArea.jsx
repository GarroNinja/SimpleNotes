import React, { useState } from "react";
import { 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Zoom, 
  Grid, 
  Tooltip,
  ClickAwayListener,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import { Menu } from "@mui/material";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";

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

function CreateArea(props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const colorMenuOpen = Boolean(colorMenuAnchor);
  const [note, setNote] = useState({
    title: "",
    content: "",
    color: "#ffffff",
    labels: []
  });
  
  // Adjust colors for dark mode
  const isDarkMode = props.darkMode;
  const adjustedColor = isDarkMode && note.color === "#ffffff" ? "#1e1e1e" : note.color;
  
  // Set text color based on background color and dark mode
  const getTextFieldColor = () => {
    if (isDarkMode) {
      return note.color === "#ffffff" ? "#ffffff" : "text.primary";
    }
    return "text.primary";
  };

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  function submitNote(event) {
    props.onAdd(note);
    setNote({
      title: "",
      content: "",
      color: "#ffffff",
      labels: []
    });
    setIsExpanded(false);
    event.preventDefault();
  }

  function expand() {
    setIsExpanded(true);
  }

  function handleColorMenuOpen(event) {
    setColorMenuAnchor(event.currentTarget);
    event.stopPropagation();
  }

  function handleColorMenuClose() {
    setColorMenuAnchor(null);
  }

  function handleColorSelect(selectedColor) {
    setNote(prevNote => ({
      ...prevNote,
      color: selectedColor
    }));
    handleColorMenuClose();
  }

  // Label functionality
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  function handleLabelDialogOpen(event) {
    setLabelDialogOpen(true);
    event.stopPropagation();
  }

  function handleLabelDialogClose() {
    setLabelDialogOpen(false);
    setNewLabel("");
  }

  function handleAddLabel() {
    if (newLabel.trim() !== "" && !note.labels.includes(newLabel.trim())) {
      setNote(prevNote => ({
        ...prevNote,
        labels: [...prevNote.labels, newLabel.trim()]
      }));
      setNewLabel("");
    }
  }

  function handleRemoveLabel(labelToRemove) {
    setNote(prevNote => ({
      ...prevNote,
      labels: prevNote.labels.filter(label => label !== labelToRemove)
    }));
  }

  return (
    <ClickAwayListener onClickAway={() => isExpanded && note.title === "" && note.content === "" && setIsExpanded(false)}>
      <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              backgroundColor: adjustedColor, 
              borderRadius: 2 
            }}
          >
            <form className="create-note">
              {isExpanded && (
                <TextField
                  name="title"
                  placeholder="Title"
                  value={note.title}
                  onChange={handleChange}
                  fullWidth
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    style: { color: isDarkMode ? "#ffffff" : "inherit" }
                  }}
                  sx={{ 
                    mb: 1,
                    "& .MuiInputBase-input::placeholder": {
                      color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"
                    }
                  }}
                />
              )}
              <TextField
                name="content"
                placeholder="Take a note..."
                value={note.content}
                onChange={handleChange}
                onClick={expand}
                multiline
                rows={isExpanded ? 3 : 1}
                fullWidth
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  style: { color: isDarkMode ? "#ffffff" : "inherit" }
                }}
                sx={{
                  "& .MuiInputBase-input::placeholder": {
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" 
                  }
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Box>
                  {isExpanded && (
                    <Tooltip title="Change color">
                      <IconButton
                        size="small"
                        onClick={handleColorMenuOpen}
                        aria-label="change note color"
                        aria-controls={colorMenuOpen ? "color-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={colorMenuOpen ? "true" : undefined}
                      >
                        <ColorLensOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {isExpanded && (
                    <Tooltip title="Add label">
                      <IconButton
                        size="small"
                        onClick={handleLabelDialogOpen}
                        aria-label="add label"
                      >
                        <LabelOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {isExpanded && note.labels.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1, mb: 1 }}>
                    {note.labels.map((label, index) => (
                      <Chip 
                        key={index} 
                        label={label} 
                        size="small" 
                        onDelete={() => handleRemoveLabel(label)}
                      />
                    ))}
                  </Box>
                )}
                <Zoom in={isExpanded}>
                  <Button
                    onClick={submitNote}
                    variant="contained"
                    color="primary"
                    sx={{ 
                      backgroundColor: "#f5ba13", 
                      borderRadius: "50%", 
                      width: "40px", 
                      height: "40px", 
                      minWidth: "auto",
                      "&:hover": { 
                        backgroundColor: "#e0a800" 
                      }
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Zoom>
              </Box>
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
                        border: note.color === colorOption ? "2px solid #000" : "1px solid #ddd",
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
            </form>
          </Paper>
        </Grid>
      </Grid>
    </ClickAwayListener>
  );
}

export default CreateArea; 