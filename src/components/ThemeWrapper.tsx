'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const pathname = usePathname();
  const { theme, userId } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // Pages qui ne doivent PAS être affectées par le thème (toujours en mode sombre)
  const protectedFromTheme = ['/login', '/', '/vitrine', '/mentions-legales'];
  
  // Pages qui peuvent avoir le thème blanc (dashboards des entreprises uniquement)
  const dashboardPages = ['/dashboard'];
  
  // Pages super admin qui doivent rester en thème sombre
  const superAdminPages = ['/superadmin'];
  
  // Vérifier si la page actuelle doit être protégée du thème
  const shouldProtectFromTheme = protectedFromTheme.some(path => pathname.startsWith(path));
  
  // Vérifier si c'est une page dashboard qui peut avoir le thème blanc
  const isDashboardPage = dashboardPages.some(path => pathname.startsWith(path));
  
  // Vérifier si c'est une page super admin qui doit rester en thème sombre
  const isSuperAdminPage = superAdminPages.some(path => pathname.startsWith(path));

  // Vérifier que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Utiliser useEffect pour accéder à document côté client uniquement
  useEffect(() => {
    if (!isClient || !userId) return; // Ne rien faire si pas encore côté client ou pas d'userId
    
    if (shouldProtectFromTheme || isSuperAdminPage) {
      // Forcer le thème sombre pour ces pages
      document.documentElement.setAttribute('data-theme', 'dark');
      // Supprimer l'ID utilisateur pour ces pages
      document.documentElement.removeAttribute('data-user-id');
    } else if (isDashboardPage) {
      // Pour les pages dashboard, appliquer le thème normal avec l'ID utilisateur
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-user-id', userId);
    } else {
      // Pour toutes les autres pages, forcer le thème sombre
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.removeAttribute('data-user-id');
    }
  }, [pathname, theme, userId, shouldProtectFromTheme, isDashboardPage, isSuperAdminPage, isClient]);

  return <>{children}</>;
}
