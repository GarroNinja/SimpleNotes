import React, { useState, useEffect } from "react";
import { CssBaseline, Container, Box, Tabs, Tab, Grid } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Header from "./Layout/Header";
import Footer from "./Layout/Footer";
import Note from "./Notes/Note";
import CreateArea from "./Notes/CreateArea";

function App() {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    const savedArchivedNotes = localStorage.getItem("archivedNotes");
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    if (savedArchivedNotes) {
      setArchivedNotes(JSON.parse(savedArchivedNotes));
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("archivedNotes", JSON.stringify(archivedNotes));
  }, [notes, archivedNotes]);

  function addNote(newNote) {
    setNotes(prevNotes => [newNote, ...prevNotes]);
  }

  function deleteNote(id) {
    setNotes(prevNotes => prevNotes.filter((_, index) => index !== id));
  }

  function deleteArchivedNote(id) {
    setArchivedNotes(prevNotes => prevNotes.filter((_, index) => index !== id));
  }

  function handlePin(id, isPinned) {
    setNotes(prevNotes => {
      const notesCopy = [...prevNotes];
      const pinnedNote = notesCopy.splice(id, 1)[0];
      if (isPinned) {
        return [pinnedNote, ...notesCopy];
      } else {
        // Find the last pinned note
        const lastPinnedIndex = notesCopy.findIndex(note => !note.isPinned);
        if (lastPinnedIndex === -1) {
          return [...notesCopy, pinnedNote];
        }
        // Insert after the last pinned note
        notesCopy.splice(lastPinnedIndex, 0, pinnedNote);
        return notesCopy;
      }
    });
  }

  function handleArchive(id) {
    setNotes(prevNotes => {
      const notesCopy = [...prevNotes];
      const archivedNote = notesCopy.splice(id, 1)[0];
      setArchivedNotes(prevArchivedNotes => [archivedNote, ...prevArchivedNotes]);
      return notesCopy;
    });
  }

  function handleUnarchive(id) {
    setArchivedNotes(prevArchivedNotes => {
      const notesCopy = [...prevArchivedNotes];
      const unarchivedNote = notesCopy.splice(id, 1)[0];
      setNotes(prevNotes => [unarchivedNote, ...prevNotes]);
      return notesCopy;
    });
  }

  function handleLabelChange(id, updatedLabels) {
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes];
      updatedNotes[id] = { ...updatedNotes[id], labels: updatedLabels };
      return updatedNotes;
    });
  }

  function handleArchivedLabelChange(id, updatedLabels) {
    setArchivedNotes(prevNotes => {
      const updatedNotes = [...prevNotes];
      updatedNotes[id] = { ...updatedNotes[id], labels: updatedLabels };
      return updatedNotes;
    });
  }

  function handleSearch(text) {
    setSearchText(text);
  }

  function handleTabChange(event, newValue) {
    setActiveTab(newValue);
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
      primary: {
        main: "#f5ba13",
      },
      background: {
        default: "#f5f5f5",
      },
    },
    typography: {
      fontFamily: '"McLaren", cursive',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Header onSearch={handleSearch} />
        <Container>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="note tabs"
              centered
            >
              <Tab label="Notes" />
              <Tab label="Archive" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <>
              <CreateArea onAdd={addNote} />
              <Grid container spacing={2} justifyContent="center">
                {filteredNotes.map((noteItem, index) => (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                    <Note
                      id={index}
                      title={noteItem.title}
                      content={noteItem.content}
                      color={noteItem.color}
                      onDelete={deleteNote}
                      onPin={handlePin}
                      onArchive={handleArchive}
                      onLabelChange={handleLabelChange}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <Grid container spacing={2} justifyContent="center">
              {filteredArchivedNotes.map((noteItem, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <Note
                    id={index}
                    title={noteItem.title}
                    content={noteItem.content}
                    color={noteItem.color}
                    onDelete={deleteArchivedNote}
                    onArchive={() => handleUnarchive(index)}
                    onLabelChange={handleArchivedLabelChange}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
