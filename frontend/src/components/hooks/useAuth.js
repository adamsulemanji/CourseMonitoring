import { useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../../App';
import { getCurrentSession, getUserAttributes } from '../utils/authUtils';
import userPool from '../../config/cognitoPool';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { setUserID, setEmail } = useContext(UserContext);

    const checkAuth = async () => {
        try {
            const currentUser = userPool.getCurrentUser();

            if (!currentUser) {
                setIsAuthenticated(false);
                return null;
            }

            const { session } = await getCurrentSession();

            if (session.isValid()) {
                const attributes = await getUserAttributes(currentUser);

                const emailAttr = attributes.find(
                    attr => attr.Name === 'email'
                );
                const subAttr = attributes.find(attr => attr.Name === 'sub');

                if (emailAttr && subAttr) {
                    setEmail(emailAttr.Value);
                    setUserID(subAttr.Value);
                }

                setIsAuthenticated(true);
                return subAttr?.Value;
            } else {
                setIsAuthenticated(false);
                return null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setIsAuthenticated(false);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
        }
        setUserID('');
        setEmail('');
        setIsAuthenticated(false);
        localStorage.clear();
    };

    return {
        isAuthenticated,
        isLoading,
        checkAuth,
        handleLogout,
    };
};
