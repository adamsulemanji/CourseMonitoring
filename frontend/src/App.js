import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Landing from './components/Landing'
import Login from './components/Login'
import Home from './components/Home'
import Signup from './components/Signup'
import ErrorPage from './components/ErrorPage'
import VerifyEmail from './components/Verify'

function App() {
    return (
        <Router>
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
        </Router>
    )
}

export default App
