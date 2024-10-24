import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import userPool from '../../config/cognitoPool';
import { UserContext } from '../../App';

function Login() {
    const [user, setUser] = useState({
        email: '',
        password: '',
    });
    const { userID, setUserID } = useContext(UserContext);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const onChange = e => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = e => {
        e.preventDefault();

        const authenticationDetails = new AuthenticationDetails({
            Username: user.email,
            Password: user.password,
        });

        const cognitoUser = new CognitoUser({
            Username: user.email,
            Pool: userPool,
        });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: result => {
                console.log('Authentication successful');
                const token = result.getIdToken().getJwtToken();

                sessionStorage.setItem('jwtToken', token);

                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.error(
                            'Error fetching attributes:',
                            err.message
                        );
                        setAlert(true);
                        setAlertMessage('Error fetching user attributes.');
                    } else {
                        const emailVerifiedAttr = attributes.find(
                            attr => attr.Name === 'email_verified'
                        );
                        const isEmailVerified =
                            emailVerifiedAttr &&
                            emailVerifiedAttr.Value === 'true';

                        if (isEmailVerified) {
                            navigate('/home');
                        } else {
                            navigate('/verify');
                        }
                    }
                });
            },
            onFailure: err => {
                console.error(
                    'Authentication failed:',
                    err.message || JSON.stringify(err)
                );
                setAlert(true);
                setAlertMessage(
                    'Incorrect email or password. Please try again.'
                );
            },
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
                                Sign in to your account
                            </h1>
                            {alert && (
                                <div
                                    className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 "
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
                                <div className="flex items-center justify-between">
                                    <button className=" block w-full bg-purple-900 text-white p-3 rounded-lg font-bold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2">
                                        Submit
                                    </button>
                                </div>
                                <p className="text-sm font-light text-gray-700 dark:text-gray-400">
                                    Don't have an account yet?{' '}
                                    <Link
                                        to="/signup"
                                        className="text-slate-900"
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
