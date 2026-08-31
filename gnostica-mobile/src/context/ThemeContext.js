import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const settingsStr = await AsyncStorage.getItem('@gnostica_settings');
                if (settingsStr) {
                    const settings = JSON.parse(settingsStr);
                    if (settings.darkMode !== undefined) {
                        setIsDarkMode(!!settings.darkMode);
                    }
                }
            } catch (error) {
                console.error('Error loading theme setting:', error);
            }
        };
        loadTheme();
    }, []);

    const toggleDarkMode = async (val) => {
        const newValue = val !== undefined ? val : !isDarkMode;
        setIsDarkMode(newValue);
        try {
            const settingsStr = await AsyncStorage.getItem('@gnostica_settings');
            const settings = settingsStr ? JSON.parse(settingsStr) : {};
            settings.darkMode = newValue;
            await AsyncStorage.setItem('@gnostica_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving theme setting:', error);
        }
    };

    const theme = {
        isDarkMode,
        toggleDarkMode,
        colors: isDarkMode ? {
            bg: 'bg-slate-900',
            bgCard: 'bg-slate-800',
            bgCardSubtle: 'bg-slate-800/80',
            border: 'border-slate-700/60',
            textPrimary: 'text-slate-100',
            textSecondary: 'text-slate-300',
            textMuted: 'text-slate-400',
            headerBg: '!bg-slate-800 !border-slate-700',
            headerText: '!text-slate-100',
            headerIcon: '#f8fafc',
            iconMuted: '#64748B',
            tabBg: '#0f172a',
            tabBorder: '#1e293b',
            tabInactive: '#64748b',
        } : {
            bg: 'bg-slate-50',
            bgCard: 'bg-white',
            bgCardSubtle: 'bg-white',
            border: 'border-slate-100',
            textPrimary: 'text-slate-800',
            textSecondary: 'text-slate-600',
            textMuted: 'text-slate-400',
            headerBg: '',
            headerText: '',
            headerIcon: '#1e293b',
            iconMuted: '#CBD5E1',
            tabBg: '#ffffff',
            tabBorder: '#f1f5f9',
            tabInactive: '#94a3b8',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
