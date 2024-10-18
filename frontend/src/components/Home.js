import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode' // This was corrected from your import statement
import ClassCard from './ClassCard';
import { Navbar, Nav, NavItem } from 'react-bootstrap';

function Home() {
    const [classes, setClasses] = useState([]);
    const [user, setUser] = useState({});
    const [userId, setUserId] = useState(null);
    const [addingClass, setAddingClass] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
            const decodedUser = jwtDecode(token.replace('Bearer ', ''));
            setUserId(decodedUser._id);
            setUser(decodedUser);

            fetchClasses(decodedUser._id);
        }
    }, []);

    const fetchClasses = async (userId) => {
        try {
            const response = await axios.get(`/api/class/user/${userId}`);
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleSaveClass = async (classData) => {
        const classToSave = { ...classData, user: userId };

        try {
            let response;
            if (classData._id) {
                response = await axios.put(`/api/class/update/${classData._id}`, classToSave);
                setClasses(
                    classes.map((classObj) =>
                        classObj._id === classData._id ? response.data : classObj
                    )
                );
            } else {
                response = await axios.post('/api/class/create', classToSave);
                setClasses([...classes, response.data]);
            }
            setAddingClass(false);
        } catch (error) {
            console.error('Error saving the class:', error.response);
        }
    };

    const handleDeleteClass = async (classId) => {
        try {
            await axios.delete(`/api/class/delete/${classId}`);
            setClasses(classes.filter((classObj) => classObj._id !== classId));
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

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
                            <Nav.Link
                                onClick={() => {
                                    sessionStorage.removeItem('jwtToken');
                                    window.location.href = '/login';
                                }}
                            >
                                Logout
                            </Nav.Link>
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
                    <div className="text-center my-8">
                        <h1 className="text-3xl">
                            Welcome <i><b>{user.email}</b></i> to Course Monitoring
                        </h1>
                    </div>

                    {classes.length === 0 ? (
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700">No tracking classes</p>
                        </div>
                    ) : (
                        classes.map((classObj) => (
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
                    <p className="text-sm font-semibold text-gray-700">Powered by Adam Sulemanji</p>
                </div>
            </section>
        </div>
    );
}

export default Home;
