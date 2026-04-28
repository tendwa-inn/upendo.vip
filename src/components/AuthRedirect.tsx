import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, sessionChecked } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!sessionChecked || location.pathname === '/callback') return; 

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    if (isAuthenticated) {
      if (!user?.profileExists && !isAuthPage) {
        navigate('/create-profile');
      } else if (isAuthPage) {
        navigate('/discover');
      }
    } else if (!isAuthPage) {
      navigate('/login');
    }
  }, [isAuthenticated, user, sessionChecked, navigate, location.pathname]);

  return <>{children}</>;
};

export default AuthRedirect;
