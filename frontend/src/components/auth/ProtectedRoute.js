import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated, isLoading, checkAuth } = useAuth();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return isAuthenticated ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default ProtectedRoute;
