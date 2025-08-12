'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // Pages qui ne doivent PAS être affectées par le thème (toujours en mode sombre)
  const protectedFromTheme = ['/login', '/', '/vitrine'];
  
  // Vérifier si la page actuelle doit être protégée du thème
  const shouldProtectFromTheme = protectedFromTheme.some(path => pathname === path);

  // Vérifier que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Utiliser useEffect pour accéder à document côté client uniquement
  useEffect(() => {
    if (!isClient) return; // Ne rien faire si pas encore côté client
    
    if (shouldProtectFromTheme) {
      // Forcer le thème sombre pour ces pages
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // Pour les autres pages, appliquer le thème normal
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [pathname, theme, shouldProtectFromTheme, isClient]);

  return <>{children}</>;
}
