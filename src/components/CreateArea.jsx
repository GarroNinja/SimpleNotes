import React, { useState } from "react";
import { 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Zoom, 
  Grid, 
  Tooltip,
  ClickAwayListener
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/system";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import { Menu } from "@mui/material";

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
    color: "#ffffff"
  });

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
      color: "#ffffff"
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

  return (
    <ClickAwayListener onClickAway={() => isExpanded && note.title === "" && note.content === "" && setIsExpanded(false)}>
      <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} sm={10} md={8} lg={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              backgroundColor: note.color, 
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
                  }}
                  sx={{ mb: 1 }}
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
                </Box>
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
            </form>
          </Paper>
        </Grid>
      </Grid>
    </ClickAwayListener>
  );
}

export default CreateArea; 