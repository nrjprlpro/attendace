import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import AppHeader from './AppHeader';

interface ProtectedRouteProps {
    allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if role is not allowed
        const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/staff/daily-entry';
        return <Navigate to={defaultPath} replace />;
    }

    // If authorized, return an outlet that will render child elements
    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ProtectedRoute;
