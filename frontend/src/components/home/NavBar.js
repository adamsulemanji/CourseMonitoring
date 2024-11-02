import React from 'react';
import { useNavigate } from 'react-router-dom';

function NavBar({ onLogout }) {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/home');
    };

    return (
        <nav className="bg-purple-900 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <button
                    className="bg-white text-purple-900 text-lg font-bold px-4 py-2 rounded"
                    onClick={goHome}
                >
                    Home
                </button>
                <button
                    className="bg-white text-purple-900 px-4 py-2 rounded text-lg font-bold"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default NavBar;
