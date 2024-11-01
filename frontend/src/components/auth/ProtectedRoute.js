import React, { useEffect, useState, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import userPool from '../../config/cognitoPool';
import { UserContext } from '../../App';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { setUserID, setEmail } = useContext(UserContext);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = userPool.getCurrentUser();

            if (!currentUser) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            // Get current session and verify token
            const session = await new Promise((resolve, reject) => {
                currentUser.getSession((err, session) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(session);
                    }
                });
            });

            if (session.isValid()) {
                // Get user attributes if session is valid
                const attributes = await new Promise((resolve, reject) => {
                    currentUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(attributes);
                        }
                    });
                });

                // Set user context
                const emailAttr = attributes.find(
                    attr => attr.Name === 'email'
                );
                const subAttr = attributes.find(attr => attr.Name === 'sub');

                if (emailAttr && subAttr) {
                    setEmail(emailAttr.Value);
                    setUserID(subAttr.Value);
                }

                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
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
