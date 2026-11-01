import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  highContrast: boolean;
  toggleHighContrast: () => void;
  speak: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('civicspot_lang') as Language) || 'en';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('civicspot_high_contrast') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('civicspot_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('civicspot_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.classList.add('contrast-125', 'font-semibold');
    } else {
      document.documentElement.classList.remove('contrast-125', 'font-semibold');
    }
  }, [highContrast]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'te') utterance.lang = 'te-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        highContrast,
        toggleHighContrast,
        speak,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
