'use client';

import { useEffect, useState } from 'react';
import { generateCSRFToken } from '../lib/security';

interface CSRFProtectionProps {
  children: React.ReactNode;
  formId?: string;
}

export default function CSRFProtection({ children, formId }: CSRFProtectionProps) {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    // Générer un token CSRF unique pour ce composant
    const token = generateCSRFToken();
    setCsrfToken(token);
    
    // Stocker le token dans le localStorage pour validation côté serveur
    if (formId) {
      localStorage.setItem(`csrf_${formId}`, token);
    }
  }, [formId]);

  return (
    <>
      {csrfToken && (
        <input 
          type="hidden" 
          name="_csrf" 
          value={csrfToken} 
          data-form-id={formId}
        />
      )}
      {children}
    </>
  );
}

// Hook pour utiliser la protection CSRF
export function useCSRF(formId: string) {
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    
    if (formId) {
      localStorage.setItem(`csrf_${formId}`, token);
    }
  }, [formId]);

  return csrfToken;
}
