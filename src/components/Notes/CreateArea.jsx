import React, { useState, useEffect } from "react";
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
  Chip,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import { Menu, MenuItem } from "@mui/material";
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
  "#8bc34a", // lime green (our primary theme color)
];

function CreateArea(props) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const colorMenuOpen = Boolean(colorMenuAnchor);
  const [note, setNote] = useState({
    title: "",
    content: "",
    color: "#ffffff",
    labels: [],
    isPinned: false
  });
  
  // Adjust colors for dark mode
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Force the default color to dark when in dark mode on component mount or dark mode changes
  useEffect(() => {
    if (isDarkMode && note.color === "#ffffff") {
      setNote(prevNote => ({
        ...prevNote,
        color: theme.palette.noteBackground
      }));
    } else if (!isDarkMode && note.color === theme.palette.noteBackground) {
      setNote(prevNote => ({
        ...prevNote,
        color: "#ffffff"
      }));
    }
  }, [isDarkMode, theme.palette.noteBackground]);
  
  // Get the adjusted background color for the note
  const getBackgroundColor = (color) => {
    if (color === "#ffffff" && isDarkMode) {
      return theme.palette.noteBackground;
    }
    return color;
  };
  
  // Get proper text color based on background color
  const getTextColor = (bgColor) => {
    // If it's dark mode and using the default color, use the theme text color
    if (isDarkMode && (bgColor === "#ffffff" || bgColor === theme.palette.noteBackground)) {
      return theme.palette.text.primary;
    }
    
    // For colored notes, determine if we need light or dark text
    const isLightColor = ["#ffffff", "#a7ffeb", "#cbf0f8", "#ccff90", "#fff475", "#fdcfe8"].includes(bgColor);
    return isLightColor ? theme.palette.text.primary : theme.palette.getContrastText(bgColor);
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
    if (note.title.trim() === "" && note.content.trim() === "") {
      return; // Don't add empty notes
    }
    
    props.onAdd({
      ...note,
      color: getBackgroundColor(note.color)
    });
    
    setNote({
      title: "",
      content: "",
      color: isDarkMode ? theme.palette.noteBackground : "#ffffff",
      labels: [],
      isPinned: false
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

  // Get the current background color to display
  const displayBackgroundColor = getBackgroundColor(note.color);
  const textColor = getTextColor(displayBackgroundColor);

  return (
    <ClickAwayListener onClickAway={() => isExpanded && note.title === "" && note.content === "" && setIsExpanded(false)}>
      <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              backgroundColor: displayBackgroundColor,
              color: textColor,
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <form className="create-note" onSubmit={submitNote}>
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
                    style: { color: textColor }
                  }}
                  sx={{ 
                    mb: 1,
                    "& .MuiInputBase-input": { 
                      color: textColor,
                      fontSize: "1.2rem"
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: textColor ? `${textColor}99` : undefined,
                      opacity: 1
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
                  style: { color: textColor }
                }}
                sx={{
                  "& .MuiInputBase-input": { 
                    color: textColor 
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: textColor ? `${textColor}99` : undefined,
                    opacity: 1
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
                        sx={{ color: textColor }}
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
                        sx={{ color: textColor }}
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
                        sx={{
                          backgroundColor: isDarkMode 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.08)',
                          color: textColor
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Zoom in={isExpanded}>
                  <Tooltip title="Add Note">
                    <IconButton 
                      type="submit"
                      color="primary"
                      sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Zoom>
              </Box>
            </form>
          </Paper>
          
          {/* Color menu */}
          <Menu
            id="color-menu"
            anchorEl={colorMenuAnchor}
            open={colorMenuOpen}
            onClose={handleColorMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", width: 136, p: 0.5 }}>
              {colors.map((colorOption, index) => (
                <Box
                  key={index}
                  onClick={() => handleColorSelect(colorOption)}
                  sx={{
                    width: 30,
                    height: 30,
                    m: 0.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: "50%",
                    backgroundColor: isDarkMode && colorOption === "#ffffff" 
                      ? theme.palette.noteBackground 
                      : colorOption,
                    cursor: "pointer",
                    "&:hover": {
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                    ...(note.color === colorOption && {
                      border: `2px solid ${theme.palette.primary.main}`,
                    }),
                  }}
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
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }
            }}
          >
            <DialogTitle>Add Label</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="label"
                label="Label"
                type="text"
                fullWidth
                variant="outlined"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLabel();
                  }
                }}
              />
              {note.labels.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 1 }}>Current Labels:</Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {note.labels.map((label, index) => (
                      <Chip 
                        key={index} 
                        label={label} 
                        size="small" 
                        onDelete={() => handleRemoveLabel(label)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleLabelDialogClose}>Cancel</Button>
              <Button onClick={handleAddLabel} color="primary">Add</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </ClickAwayListener>
  );
}

export default CreateArea; 