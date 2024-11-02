import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import { getCurrentSession, getUserAttributes } from '../utils/authUtils';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

import userPool from '../../config/cognitoPool';

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

            const { user: currentUser, token } = await getCurrentSession();
            const attributes = await getUserAttributes(currentUser);

            const emailAttr = attributes.find(attr => attr.Name === 'email');
            const subAttr = attributes.find(attr => attr.Name === 'sub');

            if (!emailAttr || !subAttr)
                throw new Error('Required attributes not found');

            setEmail(emailAttr.Value);
            setUserID(subAttr.Value);
            setIsAuthenticated(true);

            return subAttr.Value;
        } catch (error) {
            setError(error.message || 'Authentication check failed');
            resetAuthState();
            navigate('/login');
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
            navigate('/');
        } catch (error) {
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

                const attributes = await getUserAttributes(cognitoUser);

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

    const handleSignup = useCallback(
        async (email, password, phone) => {
            setIsLoading(true);
            try {
                setError(null);
                console.log(email, password, phone); // Your existing logging

                // Create the attribute list with the phone number
                const attributeList = [
                    {
                        Name: 'phone_number',
                        Value: phone,
                    },
                ];

                const result = await new Promise((resolve, reject) => {
                    userPool.signUp(
                        email,
                        password,
                        attributeList, // Pass the properly formatted attributeList
                        null,
                        (err, data) => {
                            if (err) {
                                console.error('Signup error:', err); // Add error logging
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        }
                    );
                });

                return result;
            } catch (error) {
                console.error('Signup failed:', error);
                setError(error.message || 'Signup failed');
                resetAuthState();
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [resetAuthState]
    );

    const handleVerification = useCallback(async (email, verificationCode) => {
        setIsLoading(true);
        try {
            setError(null);

            const user = new CognitoUser({
                Username: email,
                Pool: userPool,
            });

            const result = await new Promise((resolve, reject) => {
                user.confirmRegistration(
                    verificationCode,
                    true,
                    (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    }
                );
            });

            return result;
        } catch (error) {
            console.error('Verification failed:', error);
            setError(error.message || 'Verification failed');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isAuthenticated,
        isLoading,
        error,
        checkAuth,
        handleLogout,
        handleLogin,
        handleSignup,
        handleVerification,
    };
};
