# SimpleNotes

A modern note-taking application with a beautiful lime green UI theme, dark mode support, and PostgreSQL database integration.

## Features

- Create, read, update, and delete notes
- Pin important notes
- Archive notes you don't need right now
- Add labels to organize your notes
- Search functionality
- Dark mode support
- Custom color selection for notes
- PostgreSQL database for persistent storage

## Tech Stack

### Frontend
- React
- Material-UI
- CSS-in-JS styling

### Backend
- Express.js
- PostgreSQL (via Supabase)
- Node.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/SimpleNotes.git
cd SimpleNotes
```

2. Install dependencies for both frontend and backend
```
npm run install:all
```

3. Set up environment variables

#### Backend (.env file in the server directory)
```
PORT=5000
DATABASE_URL=postgres://<username>:<password>@db.xxxxxxxxx.supabase.co:6543/<database-name>
NODE_ENV=development
```

#### Frontend (.env file in the root directory)
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Initialize the database

Run the SQL script in `server/init.sql` on your PostgreSQL database to set up the required tables and sample data.

5. Start the development server
```
npm run dev
```

This will start both the frontend and backend servers.

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
SimpleNotes/
├── public/           # Static files
├── src/              # Frontend source code
│   ├── api/          # API service modules
│   ├── components/   # React components
│   └── ...
├── server/           # Backend source code
│   ├── config.js     # Server configuration
│   ├── init.sql      # Database initialization SQL
│   ├── server.js     # Express server setup
│   └── ...
└── ...
```

## Deployment

### Frontend

Build the React app for production:
```
npm run build
```

### Backend

Ensure your environment variables are set correctly for production.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# Keeper App built with React

## Similar to Google's Keep app.

Created this app after being inroduced to the fundamentals of React developement.

Udemy Course: The Complete 2020 Web Development Bootcamp
<br>
By Dr. Angela Yu
<hr>

![Keeper App](https://github.com/SeckMohameth/Keeper-App/blob/master/Images/Screen%20Shot%202020-04-21%20at%206.02.14%20PM.png?raw=true)

## Section 32: React.js
Topics covered
- Introduction to JSX and Babel
- Javascript Expression in JSX & ES6 Template Literals
- Inline Styling
- Dev tools 
- React Components
- Props
- Mapping
- Event Handlers
- React Forms
- Changing State, Hooks, and more


