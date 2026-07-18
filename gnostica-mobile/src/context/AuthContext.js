import React, { createContext, useState, useContext, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra xem đã đăng nhập chưa khi khởi động app
        const loadAuthData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const userData = await AsyncStorage.getItem('user');
                if (token && userData) {
                    setIsAuthenticated(true);
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Failed to load auth data', error);
            } finally {
                setLoading(false);
            }
        };
        loadAuthData();

        const subscription = DeviceEventEmitter.addListener('auth.logout', async () => {
            try {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
            } catch (e) {
                console.error(e);
            }
        });

        return () => subscription.remove();
    }, []);

    const login = async (authResponse) => {
        try {
            const { token, ...userData } = authResponse.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);
            setUser(userData);
        } catch (error) {
            console.error('Failed to save auth data', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Failed to remove auth data', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
