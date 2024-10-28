import React from 'react';
import { useNavigate } from 'react-router-dom';

function ErrorPage() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-purple-700 mb-4">
                    Oopsie!
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Something went wrong. The page you're looking for doesn't
                    exist.
                </p>
                <button
                    onClick={handleGoHome}
                    className="bg-purple-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-700"
                >
                    Go Back to Home
                </button>
            </div>
        </div>
    );
}

export default ErrorPage;
