import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userPool from '../../config/cognitoPool';
import { UserContext } from '../../App';
import Validate from '../../validation/validate';
function Signup() {
    const { userID, setUserID, email, setEmail } = useContext(UserContext);
    const navigate = useNavigate();
    const [alert, setAlert] = useState(false);
    const [alertResponse, setAlertResponse] = useState('');

    const [formInput, setFormInput] = useState({
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    const onChange = e => {
        setFormInput({ ...formInput, [e.target.name]: e.target.value });
    };

    const onSubmit = e => {
        e.preventDefault();

        const validate = Validate(formInput);
        if (!validate) {
            setAlert(true);
            setAlertResponse(validate.message);
        }

        // Use Cognito to sign up
        userPool.signUp(
            formInput.email,
            formInput.password,
            [
                { Name: 'phone_number', Value: formInput.phone },
                { Name: 'email', Value: formInput.email },
            ],
            null,
            async (err, result) => {
                if (err) {
                    setAlert(true);
                    setAlertResponse(err.message || JSON.stringify(err));
                    return;
                }
                console.log('User registered successfully:', result.user);
                navigate('/verify');
                setEmail(formInput.email);
            }
        );
    };

    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <Link
                        to="/"
                        className="flex items-center mb-6 text-7xl font-semibold text-purple-900"
                    >
                        Course Monitoring
                    </Link>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-2xl xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Create a new account
                            </h1>
                            {alert && (
                                <div
                                    className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 "
                                    role="alert"
                                >
                                    <span className="font-medium">
                                        {alertResponse}
                                    </span>{' '}
                                    Please try again.
                                </div>
                            )}
                            <form
                                className="space-y-4 md:space-y-6"
                                onSubmit={onSubmit}
                            >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Your email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="name@company.com"
                                        required=""
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="confirmEmail"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Confirm email
                                    </label>
                                    <input
                                        type="email"
                                        name="confirmEmail"
                                        id="confirmEmail"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        placeholder="name@company.com"
                                        required=""
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required=""
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required=""
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required=""
                                        onChange={onChange}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button className="block w-full bg-purple-900 text-white p-3 rounded-lg font-bold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                                        Submit
                                    </button>
                                </div>
                                <p className="text-sm font-light text-gray-700 dark:text-gray-400">
                                    Already have an account?{' '}
                                    <Link
                                        to="/login"
                                        className="text-slate-900"
                                    >
                                        Sign in
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

export default Signup;
