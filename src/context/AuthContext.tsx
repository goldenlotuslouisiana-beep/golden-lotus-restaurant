import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    loyaltyPoints?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('user_jwt');
        const savedUser = localStorage.getItem('user_data');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('user_jwt');
                localStorage.removeItem('user_data');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth?action=login?action=user-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error || 'Login failed' };

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('user_jwt', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            return { success: true };
        } catch {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const signup = async (info: { name: string; email: string; phone: string; password: string }) => {
        try {
            const res = await fetch('/api/auth?action=login?action=signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(info),
            });
            const data = await res.json();
            if (!res.ok) return { success: false, error: data.error || 'Signup failed' };

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('user_jwt', data.token);
            localStorage.setItem('user_data', JSON.stringify(data.user));
            return { success: true };
        } catch {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user_jwt');
        localStorage.removeItem('user_data');
    };

    const updateUser = (data: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...data };
            localStorage.setItem('user_data', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, isLoading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
