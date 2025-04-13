'use client'

import {createContext, useContext, useEffect, useState} from 'react'
import {useRouter} from "next/navigation";
import api from "@/lib/api";

interface AuthContextType {
    user: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
}

const  AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("access");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            setUser(storedUser);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const res = await api.post('token/', { username, password });
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        localStorage.setItem('user', username); // Zapisz użytkownika
        setUser(username);
        router.push('/dashboard');
    };

    const register = async (data: RegisterData) => {
        await api.post('register/', data);
        router.push('/login');
    }

    const logout = async () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        router.push('/auth/login');
    }

    return (
        <AuthContext.Provider value={{user, login, register, logout, isAuthenticated: !!user}}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within the AuthProvider");
    }
    return context;
}

