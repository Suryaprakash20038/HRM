import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginAs, setLoginAs] = useState('employee');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login({ email, password, loginAs });
            // Route based on user role
            const role = userData?.role?.toLowerCase() || '';
            if (['employee', 'teamlead', 'manager'].includes(role)) {
                // Employee/TL/Manager users go to employee panel
                navigate('/employee/dashboard');
            } else {
                // Admin/HR users go to main dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message" style={{ color: '#ffb3b3', textAlign: 'center', marginBottom: '15px', fontSize: '0.9rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div className="role-group">
                        <div className="role-option">
                            <input
                                type="radio"
                                name="loginAs"
                                id="role-admin"
                                value="admin"
                                checked={loginAs === 'admin'}
                                onChange={(e) => setLoginAs(e.target.value)}
                            />
                            <label htmlFor="role-admin" className="role-label">
                                Admin
                            </label>
                        </div>
                        <div className="role-option">
                            <input
                                type="radio"
                                name="loginAs"
                                id="role-employee"
                                value="employee"
                                checked={loginAs === 'employee'}
                                onChange={(e) => setLoginAs(e.target.value)}
                            />
                            <label htmlFor="role-employee" className="role-label">
                                Employee
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email or Employee ID</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            placeholder="Enter your email or Employee ID"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="forgot-password-link" style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                        <Link to="/forgot-password" style={{ color: '#E6C7E6', fontSize: '0.9rem', textDecoration: 'none', opacity: 0.8 }}>Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/register" className="link">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
