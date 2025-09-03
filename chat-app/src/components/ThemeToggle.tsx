'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>(() => 'light');
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light'|'dark'|null;
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="border rounded px-3 py-1 text-sm hover:bg-white/10"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? 'Темная' : 'Светлая'} тема
    </button>
  );
}


