// Debug component to track navigation and user state
import React from 'react';
import { useLocation } from 'react-router-dom';

const NavigationDebugger: React.FC<{ user: any }> = ({ user }) => {
  const location = useLocation();

  React.useEffect(() => {
    console.log('🚀 Navigation Debug:', {
      currentPath: location.pathname,
      userExists: !!user,
      userRole: user?.role || 'none',
      timestamp: new Date().toISOString()
    });

    if (location.pathname === '/hospitals') {
      console.log('🏥 Hospitals route accessed:', {
        willRenderHospitalList: !!user && (user.role === 'ROLE_ADMIN'),
        authenticationStatus: !!user ? 'logged in' : 'not logged in',
        roleCheck: user?.role === 'ROLE_ADMIN' ? 'ADMIN access granted' : 'ADMIN access denied'
      });
    }
  }, [location.pathname, user]);

  return null; // This component doesn't render anything visual
};

export default NavigationDebugger;
