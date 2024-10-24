import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import userPool from '../../config/cognitoPool';

function Verify() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');
    const navigator = useNavigate();

    const handleVerification = () => {
        const user = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        user.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                setMessage(`Verification failed: ${err.message}`);
                if (err.code === 'ExpiredCodeException') {
                    resendVerificationCode();
                }
            } else {
                setMessage('Verification successful! Redirecting you to home.');
                setTimeout(() => {
                    navigator('/home');
                }, 5000);
            }
        });
    };

    const resendVerificationCode = () => {
        const user = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        user.resendConfirmationCode((err, result) => {
            if (err) {
                setMessage(
                    `Resending verification code failed: ${err.message}`
                );
            }
            setMessage('Verification code resent successfully.');
        });
    };

    return (
        <div>
            <section>
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a
                        href="/"
                        className="flex items-center mb-6 text-7xl font-semibold text-purple-900"
                    >
                        Course Monitoring
                    </a>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Verify Your Email
                            </h1>
                            {message && (
                                <div
                                    className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
                                    role="alert"
                                >
                                    <span className="font-medium">
                                        {message}
                                    </span>
                                </div>
                            )}
                            <form
                                className="space-y-4 md:space-y-6"
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleVerification();
                                }}
                            >
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Email"
                                        required
                                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:border-purple-500 focus:outline-none focus:ring"
                                    />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="verificationCode"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={e =>
                                            setVerificationCode(e.target.value)
                                        }
                                        placeholder="Enter verification code"
                                        required
                                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:border-purple-500 focus:outline-none focus:ring"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        className="block w-full bg-purple-900 text-white p-3 rounded-lg font-bold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                                    >
                                        Verify Email
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Verify;
