'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BiGlobe, BiChevronDown, BiCheck } from 'react-icons/bi';

export const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'en', flag: 'us' },
  { label: 'বাংলা (Bangla)', value: 'bn', flag: 'bd' },
  { label: 'Español (Spanish)', value: 'es', flag: 'es' },
  { label: 'हिन्दी (Hindi)', value: 'hi', flag: 'in' },
  { label: 'Deutsch (German)', value: 'de', flag: 'de' },
];

export default function TranslateButton({
  align = 'right',
  showLabel = false,
  variant = 'dark', // 'dark' | 'auto'
  className = '',
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Read current NEXT_LOCALE cookie
    const match = document.cookie.match(/NEXT_LOCALE=([a-z]{2})/i);
    if (match && match[1]) {
      setCurrentLang(match[1].toLowerCase());
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Set cookie for next-intl (1 year expiration)
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000; SameSite=Lax`;

    // Refresh server components to re-render with new locale
    router.refresh();
  };

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.value === currentLang) || SUPPORTED_LANGUAGES[0];

  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`} ref={dropdownRef}>
      {showLabel && (
        <span className="text-xs opacity-80 flex items-center gap-1 font-medium select-none pointer-events-none text-slate-300">
          <BiGlobe className="text-sm opacity-90" />
          <span>Language:</span>
        </span>
      )}

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600 shadow-sm'
            : 'bg-white/90 hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <BiGlobe className="text-sm text-indigo-400" />
        <img
          src={`https://flagcdn.com/w20/${currentLangObj.flag}.png`}
          alt=""
          className="w-4 h-3 object-cover rounded-xs"
          loading="lazy"
        />
        <span>{currentLangObj.label.split(' ')[0]}</span>
        <BiChevronDown
          className={`text-sm opacity-70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute bottom-full mb-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          } w-48 rounded-xl border shadow-xl z-50 py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 text-slate-200 divide-slate-800'
              : 'bg-white/95 border-slate-200 text-slate-800 divide-slate-100'
          }`}
          role="menu"
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-semibold tracking-wider text-slate-400 select-none">
            Choose Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.value === currentLang;
            return (
              <button
                key={lang.value}
                type="button"
                onClick={() => handleSelectLanguage(lang.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                      : 'bg-indigo-50 text-indigo-600 font-semibold'
                    : isDark
                    ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={`https://flagcdn.com/w20/${lang.flag}.png`}
                    alt=""
                    className="w-4 h-3 object-cover rounded-xs"
                    loading="lazy"
                  />
                  <span>{lang.label}</span>
                </div>
                {isSelected && <BiCheck className="text-base text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
