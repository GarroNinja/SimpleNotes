import React, { useState, useEffect, useRef } from "react";
import { 
  Paper, 
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
  Box,
  Typography,
  Divider,
  Menu,
  Button,
  TextField,
  styled
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

// Note color options
const colors = [
  "#ffffff", // default/white
  "#f28b82", // red
  "#fbbc04", // orange
  "#fff475", // yellow
  "#ccff90", // green
  "#a7ffeb", // teal
  "#cbf0f8", // blue
  "#d7aefb", // purple
  "#fdcfe8", // pink
  "#8bc34a", // lime green (primary theme color)
];

// Create custom styled TextField
const TransparentTextField = styled(TextField)(({ theme, textColor, backgroundColor, isDarkMode }) => ({
  width: '100%',
  '& .MuiInputBase-root': {
    color: textColor,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: isDarkMode ? '#1e1e1e !important' : 'transparent',
  },
  '& .MuiInputBase-input': {
    padding: '8px 0',
    backgroundColor: isDarkMode ? '#1e1e1e !important' : 'transparent',
  },
  '& .MuiInput-underline:before, & .MuiInput-underline:after': {
    display: 'none',
  },
  '& textarea, & input': {
    background: isDarkMode ? '#1e1e1e !important' : 'transparent',
    backgroundColor: isDarkMode ? '#1e1e1e !important' : 'transparent',
  }
}));

function CreateArea(props) {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  
  // Initialize note state
  const [note, setNote] = useState({
    title: "",
    content: "",
    color: theme.palette.mode === 'dark' ? "#2d2d2d" : "#ffffff",
    labels: [],
    isPinned: false
  });
  
  // Update note color when theme changes
  useEffect(() => {
    // When theme changes, update the note color if it's the default
    if (note.color === "#2d2d2d" || note.color === "#ffffff") {
      setNote(prevNote => ({
        ...prevNote,
        color: theme.palette.mode === 'dark' ? "#2d2d2d" : "#ffffff"
      }));
    }
  }, [theme.palette.mode, note.color]);
  
  // Force black backgrounds for inputs in dark mode
  useEffect(() => {
    // Create a style element to override browser defaults
    const style = document.createElement('style');
    const isDarkMode = theme.palette.mode === 'dark';
    
    style.innerHTML = isDarkMode 
      ? `
        .note-paper textarea, 
        .note-paper input {
          background-color: #1e1e1e !important;
          background: #1e1e1e !important;
          -webkit-background-fill-color: #1e1e1e !important;
          box-shadow: none !important;
        }
      `
      : `
        textarea, input {
          background-color: transparent !important;
          -webkit-background-fill-color: transparent !important;
          box-shadow: none !important;
        }
      `;
    
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, [theme.palette.mode]);
  
  // Handle direct DOM manipulations when refs are available
  useEffect(() => {
    const isDarkMode = theme.palette.mode === 'dark';
    const bgColor = isDarkMode ? '#1e1e1e' : 'transparent';
    
    const applyBg = (elem) => {
      if (elem) {
        elem.style.backgroundColor = bgColor;
        elem.style.background = bgColor;
        // For WebKit
        if ('webkitBackgroundFillColor' in elem.style) {
          elem.style.webkitBackgroundFillColor = bgColor;
        }
      }
    };
    
    // Apply to title input
    if (titleInputRef.current) {
      const inputElement = titleInputRef.current.querySelector('input');
      if (inputElement) applyBg(inputElement);
    }
    
    // Apply to content textarea
    if (contentInputRef.current) {
      const textareaElement = contentInputRef.current.querySelector('textarea');
      if (textareaElement) applyBg(textareaElement);
    }
  }, [isExpanded, titleInputRef.current, contentInputRef.current, theme.palette.mode]);
  
  // Handle form input changes
  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => ({
      ...prevNote,
      [name]: value
    }));
  }

  // Submit the note
  function submitNote(event) {
    event.preventDefault();
    
    if (note.title.trim() === "" && note.content.trim() === "") {
      return; // Don't submit empty notes
    }
    
    props.onAdd(note);
    
    // Reset the form
    setNote({
      title: "",
      content: "",
      color: theme.palette.mode === 'dark' ? "#2d2d2d" : "#ffffff",
      labels: [],
      isPinned: false
    });
    
    setIsExpanded(false);
  }

  function expand() {
    setIsExpanded(true);
  }

  // Color selection functionality
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

  // Pin functionality
  function handleTogglePin() {
    setNote(prevNote => ({
      ...prevNote,
      isPinned: !prevNote.isPinned
    }));
  }

  // Label functionality
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
  
  // Determine background and text colors based on theme and selected color
  const isDarkMode = theme.palette.mode === 'dark';
  let noteBackground = note.color;
  
  // Special handling for white in dark mode
  if (isDarkMode && note.color === "#ffffff") {
    noteBackground = "#2d2d2d";
  }
  
  // Determine text color based on background
  const getTextColor = (bgColor) => {
    // Helper function to determine if color is light
    const isLightColor = (color) => {
      // For dark mode's dark background, always use light text
      if (isDarkMode && color === "#2d2d2d") {
        return false;
      }
      
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate brightness (higher value means lighter color)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 150; // Threshold for determining light vs dark
    };
    
    // Return appropriate text color based on background brightness
    return isLightColor(bgColor) ? "#212121" : "#ffffff";
  };
  
  const textColor = getTextColor(noteBackground);
  
  // Helper function to determine chip colors based on note color
  const getChipStyle = () => {
    const isLightNote = getTextColor(noteBackground) === "#212121";
    
    return {
      backgroundColor: isLightNote ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
      color: textColor,
      ".MuiChip-deleteIcon": {
        color: `${textColor} !important`,
        opacity: 0.7,
        "&:hover": {
          opacity: 1
        }
      }
    };
  };

  return (
    <ClickAwayListener 
      onClickAway={() => {
        if (isExpanded && note.title.trim() === "" && note.content.trim() === "") {
          setIsExpanded(false);
        }
      }}
    >
      <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper 
            elevation={3}
            className="note-paper"
            sx={{ 
              p: 2, 
              backgroundColor: noteBackground,
              color: textColor,
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: theme.shadows[6]
              }
            }}
          >
            <form 
              onSubmit={submitNote} 
              className={isDarkMode ? "dark-mode-form" : ""}
              style={{
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
              }}
            >
              {isExpanded && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box 
                    sx={{ 
                      flex: 1,
                      position: 'relative'
                    }}
                  >
                    <TransparentTextField
                      ref={titleInputRef}
                      name="title"
                      value={note.title}
                      onChange={handleChange}
                      placeholder="Title"
                      variant="standard"
                      fullWidth
                      InputProps={{
                        style: {
                          fontSize: '1.2rem',
                          fontWeight: '500',
                          background: isDarkMode ? '#1e1e1e' : 'transparent',
                          backgroundColor: isDarkMode ? '#1e1e1e' : 'transparent',
                        },
                        disableUnderline: true,
                      }}
                      textColor={textColor}
                      backgroundColor={noteBackground}
                      isDarkMode={isDarkMode}
                    />
                  </Box>
                  <Tooltip title={note.isPinned ? "Unpin note" : "Pin note"}>
                    <IconButton 
                      size="small" 
                      onClick={handleTogglePin}
                      sx={{ color: textColor }}
                    >
                      {note.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              {isExpanded && (
                <Divider sx={{ 
                  my: 1, 
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)' 
                }} />
              )}
              
              <Box 
                sx={{ 
                  width: '100%',
                  position: 'relative'
                }}
              >
                <TransparentTextField
                  ref={contentInputRef}
                  name="content"
                  value={note.content}
                  onChange={handleChange}
                  onClick={expand}
                  placeholder="Take a note..."
                  multiline
                  rows={isExpanded ? 3 : 1}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    style: {
                      background: isDarkMode ? '#1e1e1e' : 'transparent',
                      backgroundColor: isDarkMode ? '#1e1e1e' : 'transparent',
                    },
                    disableUnderline: true,
                  }}
                  textColor={textColor}
                  backgroundColor={noteBackground}
                  isDarkMode={isDarkMode}
                />
              </Box>
              
              {note.labels.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
                  {note.labels.map((label, index) => (
                    <Chip 
                      key={index} 
                      label={label} 
                      size="small" 
                      onDelete={() => handleRemoveLabel(label)}
                      sx={getChipStyle()}
                    />
                  ))}
                </Box>
              )}
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {isExpanded && (
                    <>
                      <Tooltip title="Change color">
                        <IconButton
                          size="small"
                          onClick={handleColorMenuOpen}
                          aria-label="change note color"
                          sx={{ 
                            color: textColor,
                            padding: 1,
                          }}
                        >
                          <ColorLensOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add label">
                        <IconButton
                          size="small"
                          onClick={handleLabelDialogOpen}
                          aria-label="add label"
                          sx={{ 
                            color: textColor,
                            padding: 1,
                          }}
                        >
                          <LabelOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
                
                <Zoom in={isExpanded}>
                  <Tooltip title="Add Note">
                    <IconButton 
                      type="submit"
                      color="primary"
                      sx={{ 
                        backgroundColor: theme.palette.primary.main,
                        color: '#ffffff',
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
            open={Boolean(colorMenuAnchor)}
            onClose={handleColorMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary
              }
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", width: 180, p: 0.5 }}>
              {colors.map((colorOption, index) => {
                // Adjust colors for dark mode
                let displayColor = colorOption;
                if (isDarkMode && colorOption === "#ffffff") {
                  displayColor = "#2d2d2d";
                }
                
                return (
                  <Box
                    key={index}
                    onClick={() => handleColorSelect(colorOption)}
                    sx={{
                      width: 30,
                      height: 30,
                      m: 0.5,
                      border: "1px solid",
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                      borderRadius: "50%",
                      backgroundColor: displayColor,
                      cursor: "pointer",
                      "&:hover": {
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                      ...(note.color === colorOption && {
                        border: `2px solid ${theme.palette.primary.main}`,
                      }),
                    }}
                  />
                );
              })}
            </Box>
          </Menu>
          
          {/* Label Dialog */}
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
                label="New Label"
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: theme.palette.text.primary,
                  }
                }}
              />
              {note.labels.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Labels:</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {note.labels.map((label, index) => (
                      <Chip 
                        key={index} 
                        label={label} 
                        size="small" 
                        onDelete={() => handleRemoveLabel(label)}
                        sx={{
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                          color: theme.palette.text.primary
                        }}
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