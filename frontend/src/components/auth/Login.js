import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Login() {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const onChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setAlert(false);

        try {
            await handleLogin(user.email, user.password);
            navigate('/');
        } catch (error) {
            setAlert(true);
            setAlertMessage(
                error.message || 'Login failed. Please check your credentials.'
            );
        }
    };

    return (
        <div>
            <section>
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <Link
                        to="/"
                        className="flex items-center mb-6 text-7xl font-semibold text-purple-900"
                    >
                        Course Monitoring
                    </Link>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Sign in to your account
                            </h1>
                            {alert && (
                                <div
                                    className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
                                    role="alert"
                                >
                                    <span className="font-medium">
                                        {alertMessage}
                                    </span>
                                </div>
                            )}
                            <form
                                className="space-y-4 md:space-y-6"
                                onSubmit={handleSubmit}
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
                                        name="email"
                                        value={user.email}
                                        onChange={onChange}
                                        placeholder="Email"
                                        required
                                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:border-purple-500 focus:outline-none focus:ring"
                                    />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={user.password}
                                        onChange={onChange}
                                        placeholder="Password"
                                        required
                                        className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md focus:border-purple-500 focus:outline-none focus:ring"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-purple-900 text-white p-3 rounded-lg font-bold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                                >
                                    Sign In
                                </button>
                                <p className="text-sm font-light text-gray-700 dark:text-gray-400">
                                    Don't have an account yet?{' '}
                                    <Link
                                        to="/signup"
                                        className="text-slate-900 hover:underline"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
