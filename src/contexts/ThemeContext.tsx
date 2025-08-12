'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  userId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Fonction pour générer un ID unique
function generateUniqueId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Générer ou récupérer un ID utilisateur unique
    let savedUserId = localStorage.getItem('userId');
    if (!savedUserId) {
      savedUserId = generateUniqueId();
      localStorage.setItem('userId', savedUserId);
    }
    setUserId(savedUserId);

    // Récupérer le thème spécifique à cet utilisateur
    const savedTheme = localStorage.getItem(`theme_${savedUserId}`) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Sauvegarder le thème spécifique à cet utilisateur
    if (userId) {
      localStorage.setItem(`theme_${userId}`, theme);
    }
  }, [theme, userId]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, userId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 