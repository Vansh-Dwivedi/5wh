import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useRoleBasedNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    
    const role = (user.role || '').toString().trim().toLowerCase();
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'editor':
        return '/editor/dashboard';
      default:
        return '/login';
    }
  };

  const navigateToDashboard = () => {
    navigate(getDashboardPath());
  };

  return {
    getDashboardPath,
    navigateToDashboard,
    userRole: user?.role
  };
};

export default useRoleBasedNavigation;
