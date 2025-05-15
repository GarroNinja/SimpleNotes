import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";
import "./index.css";

// Add loading class to prevent transition flashing
document.documentElement.classList.add('js-loading');

// Create a root
const container = document.getElementById("root");
const root = createRoot(container);

// Render app to root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remove loading class after render to allow transitions
window.addEventListener('load', () => {
  // Short delay to ensure everything is loaded
  setTimeout(() => {
    document.documentElement.classList.remove('js-loading');
  }, 100);
});

// Report web vitals
reportWebVitals();

//1. Implement the add note functionality.
//- Create a constant that keeps track of the title and content.
//- Pass the new note back to the App.
//- Add new note to an array.
//- Take array and render seperate Note components for each item.

//2. Implement the delete note functionality.
//- Callback from the Note component to trigger a delete function.
//- Use the filter function to filter out the item that needs deletion.
//- Pass a id over to the Note component, pass it back to the App when deleting.
