import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import './DarkMode.css';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <button 
      className="dark-mode-toggle"
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? 'Light Mode' : 'Dark Mode'}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
