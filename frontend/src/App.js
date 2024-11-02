import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import Landing from './components/Landing';
import Login from './components/auth/Login';
import Home from './components/home/Home';
import Signup from './components/auth/Signup';
import ErrorPage from './components/home/ErrorPage';
import VerifyEmail from './components/auth/Verify';
import ProtectedRoute from './components/auth/ProtectedRoute';

export const UserContext = React.createContext(null);

function App() {
    const [userID, setUserID] = useState('');
    const [email, setEmail] = useState('');
    return (
        <Router>
            <UserContext.Provider
                value={{
                    userID: userID,
                    setUserID: setUserID,
                    email: email,
                    setEmail: setEmail,
                }}
            >
                <div>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify" element={<VerifyEmail />} />
                        <Route path="*" element={<ErrorPage />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </Router>
    );
}

export default App;
