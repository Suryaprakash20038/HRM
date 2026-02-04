import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            const role = (user.role || '').toLowerCase();
            if (['employee', 'teamlead', 'manager'].includes(role)) {
                // Determine if they were trying to access admin panel logic?
                // Actually, this component is used in RootRoute. 
                // We should default to Employee Dashboard
                navigate('/employee/dashboard', { replace: true });
            } else if (role === 'hr') {
                // HR -> Recruitment (skip dashboard)
                navigate('/recruitment', { replace: true });
            } else {
                // Admin/MD -> Dashboard
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return null; // Or a loading spinner
};

export default RoleBasedRedirect;
