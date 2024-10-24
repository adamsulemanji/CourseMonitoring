import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import React, { useState } from 'react'
import Landing from './components/Landing'
import Login from './components/auth/Login'
import Home from './components/Home'
import Signup from './components/auth/Signup'
import ErrorPage from './components/ErrorPage'
import VerifyEmail from './components/auth/Verify'

export const UserContext = React.createContext(null)

function App() {
    const [user, setUser] = useState()
    return (
        <Router>
            <UserContext.Provider value={{ user: user, setUser: setUser }}>
                <div>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="*" element={<ErrorPage />} />
                        <Route path="/verify" element={<VerifyEmail />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </Router>
    )
}

export default App
