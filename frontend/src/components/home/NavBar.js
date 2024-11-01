import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavBar({ onLogout }) {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/home');
    };

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <button
                    className="text-white text-lg font-bold"
                    onClick={goHome}
                >
                    Home
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
