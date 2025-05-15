import React, { useState, useEffect } from "react";
import { 
  CssBaseline, 
  Container, 
  Box, 
  Tabs, 
  Tab, 
  Grid,
  IconButton,
  useMediaQuery,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Note from "./Notes/Note";
import CreateArea from "./Notes/CreateArea";
import * as notesApi from "../api/notesApi";

// Custom theme colors
const limeGreenTheme = {
  light: {
    primary: '#8bc34a',    // Lime green
    secondary: '#4caf50',  // Green
    accent: '#cddc39',     // Lime
    background: '#f9fbe7',
    paper: '#ffffff',
    text: '#212121',
    noteBackground: '#ffffff'
  },
  dark: {
    primary: '#8bc34a',    // Lime green 
    secondary: '#4caf50',  // Green
    accent: '#cddc39',     // Lime
    background: '#212121',
    paper: '#1e1e1e',
    text: '#ffffff',
    noteBackground: '#2d2d2d'
  }
};

function App() {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Dark mode state
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode !== null ? JSON.parse(savedMode) : prefersDarkMode;
  });

  // Save dark mode preference to localStorage and apply immediately
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    
    // Update document's body class and meta theme color
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      document.documentElement.style.setProperty('--app-bg-color', limeGreenTheme.dark.background);
      document.documentElement.style.setProperty('--app-text-color', limeGreenTheme.dark.text);
      document.documentElement.style.setProperty('--note-bg-color', limeGreenTheme.dark.noteBackground);
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      document.documentElement.style.setProperty('--app-bg-color', limeGreenTheme.light.background);
      document.documentElement.style.setProperty('--app-text-color', limeGreenTheme.light.text);
      document.documentElement.style.setProperty('--note-bg-color', limeGreenTheme.light.noteBackground);
    }
    
    // Force update for input backgrounds
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      if (darkMode && !input.closest('.MuiAppBar-root')) {
        input.style.backgroundColor = '#1e1e1e';
      } else {
        input.style.backgroundColor = input.closest('.MuiAppBar-root') ? 'transparent' : 'white';
      }
    });
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", darkMode ? '#212121' : '#8bc34a');
    }
  }, [darkMode]);

  // Update note colors when theme changes
  useEffect(() => {
    const defaultLightColor = limeGreenTheme.light.noteBackground; // "#ffffff"
    const defaultDarkColor = limeGreenTheme.dark.noteBackground;   // "#2d2d2d"
    
    const updateNoteColors = async (noteList, setNoteList) => {
      // Only update notes that have the default theme colors
      const notesNeedingUpdate = noteList.filter(note => 
        (note.color === defaultLightColor && darkMode) ||
        (note.color === defaultDarkColor && !darkMode)
      );
      
      if (notesNeedingUpdate.length === 0) return;
      
      // Create updated copies of notes with the new theme-appropriate default color
      const updatedNotes = [...noteList];
      let hasChanges = false;
      
      for (let i = 0; i < updatedNotes.length; i++) {
        const note = updatedNotes[i];
        // Only update notes with the default color that doesn't match the current theme
        if ((note.color === defaultLightColor && darkMode) || (note.color === defaultDarkColor && !darkMode)) {
          const targetColor = darkMode ? defaultDarkColor : defaultLightColor;
          updatedNotes[i] = {
            ...note,
            color: targetColor
          };
          // Update the note on the server
          try {
            await notesApi.updateNote(note.id, updatedNotes[i]);
            hasChanges = true;
          } catch (err) {
            console.error('Error updating note color:', err);
          }
        }
      }
      // Update state only if changes were made
      if (hasChanges) {
        setNoteList(updatedNotes);
      }
    };
    
    // Update both regular and archived notes
    updateNoteColors(notes, setNotes);
    updateNoteColors(archivedNotes, setArchivedNotes);
    
  }, [darkMode, notes, archivedNotes]);

  // Load notes from API on initial render
  useEffect(() => {
    const fetchAllNotes = async () => {
      setLoading(true);
      try {
        const [fetchedNotes, fetchedArchivedNotes] = await Promise.all([
          notesApi.fetchNotes(),
          notesApi.fetchArchivedNotes()
        ]);
        
        // Update notes with default colors based on the current theme
        const defaultLightColor = limeGreenTheme.light.noteBackground; // "#ffffff"
        const defaultDarkColor = limeGreenTheme.dark.noteBackground;   // "#2d2d2d"
        
        // Apply theme-appropriate colors to notes with default colors
        const processedNotes = fetchedNotes.map(note => {
          // Check if note has either default color and doesn't match current theme
          const hasDefaultColor = note.color === defaultLightColor || note.color === defaultDarkColor;
          const targetColor = darkMode ? defaultDarkColor : defaultLightColor;
          
          if (hasDefaultColor && note.color !== targetColor) {
            return { ...note, color: targetColor };
          }
          return note;
        });
        
        const processedArchivedNotes = fetchedArchivedNotes.map(note => {
          // Check if note has either default color and doesn't match current theme
          const hasDefaultColor = note.color === defaultLightColor || note.color === defaultDarkColor;
          const targetColor = darkMode ? defaultDarkColor : defaultLightColor;
          
          if (hasDefaultColor && note.color !== targetColor) {
            return { ...note, color: targetColor };
          }
          return note;
        });
        
        setNotes(processedNotes);
        setArchivedNotes(processedArchivedNotes);
        setError(null);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes. Please try again later.');
        showNotification('Failed to load notes from server', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllNotes();
  }, [darkMode]); // Add darkMode dependency to re-fetch when theme changes

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  async function addNote(newNote) {
    try {
      const savedNote = await notesApi.createNote(newNote);
      setNotes(prevNotes => [savedNote, ...prevNotes]);
      showNotification('Note created successfully', 'success');
    } catch (err) {
      console.error('Error adding note:', err);
      showNotification('Failed to create note', 'error');
    }
  }

  async function deleteNote(id) {
    try {
      await notesApi.deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      showNotification('Note deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting note:', err);
      showNotification('Failed to delete note', 'error');
    }
  }

  async function deleteArchivedNote(id) {
    try {
      await notesApi.deleteNote(id);
      setArchivedNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      showNotification('Archived note deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting archived note:', err);
      showNotification('Failed to delete archived note', 'error');
    }
  }

  async function handlePin(id, isPinned) {
    try {
      const updatedNote = await notesApi.togglePinStatus(id, isPinned);
      
      setNotes(prevNotes => {
        // Remove the updated note from the list
        const filteredNotes = prevNotes.filter(note => note.id !== id);
        
        // Add the updated note at the beginning if pinned, or after all pinned notes if unpinned
        if (isPinned) {
          return [updatedNote, ...filteredNotes];
        } else {
          // Find the position after the last pinned note
          const lastPinnedIndex = filteredNotes.findIndex(note => !note.is_pinned);
          if (lastPinnedIndex === -1) {
            return [...filteredNotes, updatedNote];
          }
          // Insert after the last pinned note
          const result = [...filteredNotes];
          result.splice(lastPinnedIndex, 0, updatedNote);
          return result;
        }
      });
    } catch (err) {
      console.error('Error updating pin status:', err);
      showNotification('Failed to update pin status', 'error');
    }
  }

  async function handleArchive(id) {
    try {
      const updatedNote = await notesApi.toggleArchiveStatus(id, true);
      
      // Remove note from the notes list
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      // Add to archived notes
      setArchivedNotes(prevArchivedNotes => [updatedNote, ...prevArchivedNotes]);
      
      showNotification('Note archived successfully', 'success');
    } catch (err) {
      console.error('Error archiving note:', err);
      showNotification('Failed to archive note', 'error');
    }
  }

  async function handleUnarchive(id) {
    try {
      const updatedNote = await notesApi.toggleArchiveStatus(id, false);
      
      // Remove note from archived notes
      setArchivedNotes(prevArchivedNotes => prevArchivedNotes.filter(note => note.id !== id));
      
      // Add to regular notes
      setNotes(prevNotes => [updatedNote, ...prevNotes]);
      
      showNotification('Note unarchived successfully', 'success');
    } catch (err) {
      console.error('Error unarchiving note:', err);
      showNotification('Failed to unarchive note', 'error');
    }
  }

  async function handleLabelChange(id, updatedLabels) {
    try {
      // Find the note to update
      const noteToUpdate = notes.find(note => note.id === id);
      if (!noteToUpdate) return;
      
      // Update the note with new labels
      const updatedNote = await notesApi.updateNote(id, {
        ...noteToUpdate,
        labels: updatedLabels
      });
      
      // Update the notes state
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
    } catch (err) {
      console.error('Error updating labels:', err);
      showNotification('Failed to update labels', 'error');
    }
  }

  async function handleColorChange(id, selectedColor) {
    try {
      // Find the note to update
      const noteToUpdate = notes.find(note => note.id === id);
      if (!noteToUpdate) return;
      
      // Update the note with the new color
      const updatedNote = await notesApi.updateNote(id, {
        ...noteToUpdate,
        color: selectedColor
      });
      
      // Update the notes state
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );

      showNotification('Note color updated successfully', 'success');
    } catch (err) {
      console.error('Error updating note color:', err);
      showNotification('Failed to update note color', 'error');
    }
  }

  async function handleArchivedLabelChange(id, updatedLabels) {
    try {
      // Find the archived note to update
      const noteToUpdate = archivedNotes.find(note => note.id === id);
      if (!noteToUpdate) return;
      
      // Update the note with new labels
      const updatedNote = await notesApi.updateNote(id, {
        ...noteToUpdate,
        labels: updatedLabels
      });
      
      // Update the archived notes state
      setArchivedNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
    } catch (err) {
      console.error('Error updating labels on archived note:', err);
      showNotification('Failed to update labels on archived note', 'error');
    }
  }

  async function handleArchivedColorChange(id, selectedColor) {
    try {
      // Find the archived note to update
      const noteToUpdate = archivedNotes.find(note => note.id === id);
      if (!noteToUpdate) return;
      
      // Update the note with the new color
      const updatedNote = await notesApi.updateNote(id, {
        ...noteToUpdate,
        color: selectedColor
      });
      
      // Update the archived notes state
      setArchivedNotes(prevNotes => 
        prevNotes.map(note => note.id === id ? updatedNote : note)
      );
      
      showNotification('Note color updated successfully', 'success');
    } catch (err) {
      console.error('Error updating archived note color:', err);
      showNotification('Failed to update note color', 'error');
    }
  }

  function handleSearch(text) {
    setSearchText(text);
  }

  function handleTabChange(event, newValue) {
    setActiveTab(newValue);
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  // Filter notes based on search text
  const filteredNotes = notes.filter(
    note => 
      note.title.toLowerCase().includes(searchText.toLowerCase()) || 
      note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredArchivedNotes = archivedNotes.filter(
    note => 
      note.title.toLowerCase().includes(searchText.toLowerCase()) || 
      note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  // Create the theme based on the current dark mode state
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: limeGreenTheme[darkMode ? 'dark' : 'light'].primary,
          },
          secondary: {
            main: limeGreenTheme[darkMode ? 'dark' : 'light'].secondary,
          },
          background: {
            default: limeGreenTheme[darkMode ? 'dark' : 'light'].background,
            paper: limeGreenTheme[darkMode ? 'dark' : 'light'].paper,
          },
          text: {
            primary: limeGreenTheme[darkMode ? 'dark' : 'light'].text,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? '#1e1e1e !important' : 'transparent',
                '& input, & textarea': {
                  backgroundColor: darkMode ? '#1e1e1e !important' : 'transparent',
                }
              },
            },
          },
          // Keep AppBar always in light mode
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: limeGreenTheme.light.primary + ' !important',
                color: '#ffffff !important',
              },
            },
          },
          // Special styling for the search bar
          MuiToolbar: {
            styleOverrides: {
              root: {
                '& .MuiInputBase-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
                  color: 'white !important',
                  '& input': {
                    backgroundColor: 'transparent !important',
                    color: 'white !important',
                  }
                }
              },
            },
          },
        },
      }),
    [darkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={darkMode ? 'dark-theme' : 'light-theme'}>
        <Header 
          onSearch={handleSearch} 
          onChangeTab={handleTabChange}
          activeTab={activeTab}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
        <Container>
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' },
            justifyContent: 'flex-start', 
            alignItems: 'center',
            borderBottom: 1, 
            borderColor: "divider", 
            mb: 2,
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="note tabs"
              sx={{ 
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main 
                }
              }}
            >
              <Tab label="Notes" />
              <Tab label="Archive" />
            </Tabs>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              my: 4, 
              p: 3, 
              borderRadius: 2,
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText
            }}>
              <p>{error}</p>
            </Box>
          )}

          {!loading && !error && activeTab === 0 && (
            <>
              <CreateArea onAdd={addNote} darkMode={darkMode} />
              <Grid container spacing={2} justifyContent="center">
                {filteredNotes.map((noteItem) => (
                  <Grid item key={noteItem.id} xs={12} sm={6} md={4} lg={3}>
                    <Note
                      id={noteItem.id}
                      title={noteItem.title}
                      content={noteItem.content}
                      color={noteItem.color}
                      labels={noteItem.labels}
                      isPinned={noteItem.is_pinned}
                      onDelete={deleteNote}
                      onPin={handlePin}
                      onArchive={handleArchive}
                      onLabelChange={handleLabelChange}
                      onColorChange={handleColorChange}
                      darkMode={darkMode}
                    />
                  </Grid>
                ))}
                {filteredNotes.length === 0 && !loading && !error && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    width: '100%', 
                    mt: 4, 
                    color: theme.palette.text.secondary,
                    textAlign: 'center'
                  }}>
                    <p>No notes yet. Create one to get started!</p>
                  </Box>
                )}
              </Grid>
            </>
          )}

          {!loading && !error && activeTab === 1 && (
            <Grid container spacing={2} justifyContent="center">
              {filteredArchivedNotes.map((noteItem) => (
                <Grid item key={noteItem.id} xs={12} sm={6} md={4} lg={3}>
                  <Note
                    id={noteItem.id}
                    title={noteItem.title}
                    content={noteItem.content}
                    color={noteItem.color}
                    labels={noteItem.labels}
                    isPinned={noteItem.is_pinned}
                    onDelete={deleteArchivedNote}
                    onPin={handlePin}
                    onArchive={handleUnarchive}
                    onLabelChange={handleArchivedLabelChange}
                    onColorChange={handleArchivedColorChange}
                    darkMode={darkMode}
                  />
                </Grid>
              ))}
              {filteredArchivedNotes.length === 0 && !loading && !error && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  width: '100%', 
                  mt: 4, 
                  color: theme.palette.text.secondary,
                  textAlign: 'center'
                }}>
                  <p>No archived notes yet.</p>
                </Box>
              )}
            </Grid>
          )}
        </Container>
        <Footer />
        
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

export default App;
