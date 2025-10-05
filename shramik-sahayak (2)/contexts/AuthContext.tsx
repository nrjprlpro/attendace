
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, UserCredentials } from '../services/mockApi';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: UserCredentials) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkUserSession = useCallback(async () => {
        try {
            setLoading(true);
            const loggedInUser = await api.checkSession();
            setUser(loggedInUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]);

    const login = async (credentials: UserCredentials) => {
        const loggedInUser = await api.login(credentials);
        setUser(loggedInUser);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
