import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { CognitoUser } from 'amazon-cognito-identity-js';
import ClassCard from './ClassCard';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import userPool from '../../config/cognitoPool';
import { UserContext } from '../../App';

function Home() {
    const [classes, setClasses] = useState([]);
    const { userID, setUserID, email, setEmail } = useContext(UserContext);
    const [addingClass, setAddingClass] = useState(false);
    const navigate = useNavigate();

    console.log('User ID:', userID);

    useEffect(() => {
        const tokenKey = `CognitoIdentityServiceProvider.${userPool.clientId}.${userID}.idToken`;

        if (!userID || !email) {
            navigate('/login');
            return;
        }
    }, [userID, email, setUserID, setEmail, navigate]);

    const fetchClasses = async userId => {
        console.log('Fetching classes for user:', userId);
    };

    const handleSaveClass = async classData => {
        console.log('Saving class:', classData);
    };

    const handleDeleteClass = async classId => {
        console.log('Deleting class:', classId);
    };

    const handleLogout = () => {
        setUserID('');
        setEmail('');
        navigate('/login');
    };

    if (!userID || !email) {
        return null;
    }

    return (
        <div>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="/">Course Monitoring</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <NavItem>
                            <Nav.Link href="/home">Home</Nav.Link>
                        </NavItem>
                        <NavItem>
                            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div className="text-center my-8">
                        <h1 className="text-3xl">
                            Welcome{' '}
                            <i>
                                <b>{email}</b>
                            </i>{' '}
                            to Course Monitoring
                        </h1>
                    </div>

                    {classes.length === 0 ? (
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700">
                                No tracking classes
                            </p>
                        </div>
                    ) : (
                        classes.map(classObj => (
                            <ClassCard
                                key={classObj._id}
                                classObj={classObj}
                                onSave={handleSaveClass}
                                onDelete={handleDeleteClass}
                            />
                        ))
                    )}

                    {addingClass && (
                        <ClassCard
                            onSave={handleSaveClass}
                            onCancel={() => setAddingClass(false)}
                        />
                    )}

                    <button
                        type="button"
                        onClick={() => setAddingClass(true)}
                        className="inline-flex items-center justify-center px-4 py-2 mt-4 text-base font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Class
                    </button>
                </div>

                <div className="text-center my-8">
                    <p className="text-sm font-semibold text-gray-700">
                        Powered by Adam Sulemanji
                    </p>
                </div>
            </section>
        </div>
    );
}

export default Home;
