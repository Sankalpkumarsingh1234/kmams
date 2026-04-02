// src/i18n/LanguageContext.jsx
// Language switching context for GigShield

import { createContext, useState, useContext, useEffect } from 'react';
import { translations, defaultLanguage } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or use default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gigshield_language') || defaultLanguage;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gigshield_language', language);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language] || translations[defaultLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Return key if translation not found
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
