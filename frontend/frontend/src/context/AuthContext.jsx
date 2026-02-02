import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await authService.getCurrentUser();
                setUser(res.data.data.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (credentials) => {
        try {
            const res = await authService.login(credentials);
            const { user, token } = res.data.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Login successful!');
            return user;
        } catch (error) {
            // toast.error(error.response?.data?.message || 'Login failed'); // Handled in component
            throw error;
        }
    };

    const register = async (data) => {
        try {
            const res = await authService.register(data);
            const { user, token } = res.data.data;
            localStorage.setItem('token', token);
            setUser(user);
            toast.success('Registration successful!');
            return user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('token');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout on client side even if server fails
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
