import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import { getCurrentSession, getUserAttributes } from '../utils/authUtils';
import userPool from '../../config/cognitoPool';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setUserID, setEmail } = useContext(UserContext);
    const navigate = useNavigate();

    const resetAuthState = useCallback(() => {
        setIsAuthenticated(false);
        setUserID('');
        setEmail('');
        setError(null);
    }, [setUserID, setEmail]);

    const checkAuth = useCallback(async () => {
        setIsLoading(true);
        try {
            setError(null);

            const currentUser = userPool.getCurrentUser();
            if (!currentUser) {
                resetAuthState();
                return null;
            }

            console.log('currentUser:', currentUser);

            const session = await getCurrentSession(currentUser);
            if (!session) {
                resetAuthState();
                return null;
            }

            console.log('session:', session);

            const attributes = await getUserAttributes(currentUser);

            console.log('attributes:', attributes);
            if (!attributes)
                throw new Error('Failed to retrieve user attributes');

            const emailAttr = attributes.find(attr => attr.Name === 'email');
            const subAttr = attributes.find(attr => attr.Name === 'sub');

            if (!emailAttr || !subAttr)
                throw new Error('Required attributes not found');

            setEmail(emailAttr.Value);
            setUserID(subAttr.Value);
            setIsAuthenticated(true);

            return subAttr.Value;
        } catch (error) {
            console.error('Auth check failed:', error);
            setError(error.message || 'Authentication check failed');
            resetAuthState();
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [resetAuthState, setEmail, setUserID]);

    const handleLogout = useCallback(() => {
        try {
            const currentUser = userPool.getCurrentUser();
            if (currentUser) {
                currentUser.signOut();
            }
            localStorage.clear();
            resetAuthState();
            navigate('/home');
        } catch (error) {
            console.error('Logout failed:', error);
            setError(error.message || 'Logout failed');
        }
    }, [navigate, resetAuthState]);

    const handleLogin = useCallback(
        async (email, password) => {
            setIsLoading(true);
            try {
                setError(null);

                const authenticationDetails = new AuthenticationDetails({
                    Username: email,
                    Password: password,
                });

                const cognitoUser = new CognitoUser({
                    Username: email,
                    Pool: userPool,
                });

                const result = await new Promise((resolve, reject) => {
                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: resolve,
                        onFailure: reject,
                    });
                });

                const attributes = await new Promise((resolve, reject) => {
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) reject(err);
                        else resolve(attributes);
                    });
                });

                const emailVerifiedAttr = attributes.find(
                    attr => attr.Name === 'email_verified'
                );
                const isEmailVerified = emailVerifiedAttr?.Value === 'true';

                if (!isEmailVerified) throw new Error('Email is not verified');

                const subAttr = attributes.find(attr => attr.Name === 'sub');
                if (!subAttr) throw new Error('User ID not found');

                setUserID(subAttr.Value);
                setEmail(email);
                setIsAuthenticated(true);

                return result;
            } catch (error) {
                console.error('Login failed:', error);
                setError(error.message || 'Login failed');
                resetAuthState();
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [resetAuthState, setEmail, setUserID]
    );

    return {
        isAuthenticated,
        isLoading,
        error,
        checkAuth,
        handleLogout,
        handleLogin,
    };
};
