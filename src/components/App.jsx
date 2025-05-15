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
  Alert
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
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
  },
  dark: {
    primary: '#8bc34a',    // Lime green 
    secondary: '#4caf50',  // Green
    accent: '#cddc39',     // Lime
    background: '#212121',
    paper: '#1e1e1e',
    text: '#ffffff',
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

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    // Update document's body class for additional styling
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Load notes from API on initial render
  useEffect(() => {
    const fetchAllNotes = async () => {
      setLoading(true);
      try {
        const [fetchedNotes, fetchedArchivedNotes] = await Promise.all([
          notesApi.fetchNotes(),
          notesApi.fetchArchivedNotes()
        ]);
        
        setNotes(fetchedNotes);
        setArchivedNotes(fetchedArchivedNotes);
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
  }, []);

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

  // Create theme
  const theme = createTheme({
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
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: limeGreenTheme[darkMode ? 'dark' : 'light'].primary,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.3s, box-shadow 0.3s',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s, color 0.3s',
          },
        },
      }
    },
    typography: {
      fontFamily: '"McLaren", cursive',
    },
  });

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
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: 1, 
            borderColor: "divider", 
            mb: 2,
            display: { xs: 'none', sm: 'flex' } // Hide on mobile as we use drawer instead
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="note tabs"
            >
              <Tab label="Notes" />
              <Tab label="Archive" />
            </Tabs>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <p>Loading notes...</p>
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
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
                      darkMode={darkMode}
                    />
                  </Grid>
                ))}
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
                    onArchive={() => handleUnarchive(noteItem.id)}
                    onLabelChange={handleArchivedLabelChange}
                    darkMode={darkMode}
                  />
                </Grid>
              ))}
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
