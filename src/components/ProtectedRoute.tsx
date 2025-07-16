
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute check:', { 
    user: user?.email, 
    profile: profile?.role, 
    adminOnly, 
    loading 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('No user or profile, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && profile.role !== 'admin') {
    console.log('User is not admin, redirecting to dashboard. User role:', profile.role);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
