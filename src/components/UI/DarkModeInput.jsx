import React from 'react';
import { Box } from '@mui/material';

// A custom input component that correctly handles background colors in dark mode
function DarkModeInput({ 
  name, 
  value, 
  onChange, 
  placeholder, 
  onKeyDown, 
  onClick,
  multiline = false,
  rows = 1,
  autoFocus = false,
  style = {},
  backgroundColor,
  textColor,
  className
}) {
  const commonStyles = {
    width: '100%',
    border: 'none',
    outline: 'none',
    color: textColor || 'inherit',
    backgroundColor: backgroundColor || 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    padding: '8px 0',
    ...style
  };

  const containerStyle = {
    backgroundColor: backgroundColor || 'transparent',
    display: 'block',
    width: '100%',
    position: 'relative',
  };

  // Important: we use native HTML elements for better control of backgrounds
  if (multiline) {
    return (
      <div className="note-input-container" style={containerStyle}>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onClick={onClick}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={rows}
          autoFocus={autoFocus}
          style={commonStyles}
          className={`note-input ${className || ''}`}
        />
      </div>
    );
  }
  
  return (
    <div className="note-input-container" style={containerStyle}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onClick={onClick}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={commonStyles}
        className={`note-input ${className || ''}`}
      />
    </div>
  );
}

export default DarkModeInput; 