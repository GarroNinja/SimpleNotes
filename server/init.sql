-- Drop existing tables if they exist
DROP TABLE IF EXISTS notes;

-- Create notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  color VARCHAR(50) DEFAULT '#ffffff',
  labels TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_notes_archived ON notes(archived);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned);

-- Insert some sample data
INSERT INTO notes (title, content, color, labels, is_pinned, archived)
VALUES 
  ('Welcome to SimpleNotes', 'This is your first note! You can add more notes, archive them, or delete them.', '#8bc34a', '{"welcome", "first note"}', TRUE, FALSE),
  ('Shopping List', 'Milk\nEggs\nBread\nButter', '#fff475', '{"shopping", "groceries"}', FALSE, FALSE),
  ('Meeting Notes', 'Discuss project timeline\nAssign tasks\nSet up next meeting', '#a7ffeb', '{"work", "meeting"}', FALSE, FALSE),
  ('Archived Note Example', 'This is an example of an archived note.', '#f28b82', '{"example", "archived"}', FALSE, TRUE); 