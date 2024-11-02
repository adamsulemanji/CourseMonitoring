import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import ClassCard from './ClassCard';
import NavBar from './NavBar';
import { useAuth } from '../hooks/useAuth';
import { useClasses } from '../hooks/useClasses';

function Home() {
    const { userID, email } = useContext(UserContext);
    const [addingClass, setAddingClass] = useState(false);
    const { checkAuth, handleLogout, isLoading } = useAuth();
    const { classes, fetchClasses, saveClass, deleteClass } =
        useClasses(handleLogout);

    useEffect(() => {
        const initializeAuth = async () => {
            const userId = await checkAuth();
            if (userId) {
                await fetchClasses(userId);
            }
        };

        initializeAuth();
    }, [checkAuth, fetchClasses]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!userID || !email) {
        return null;
    }

    const handleSaveClass = async classData => {
        try {
            await saveClass(classData);
            setAddingClass(false);
        } catch (error) {
            // Handle error (show notification, etc.)
        }
    };

    return (
        <div>
            <NavBar onLogout={handleLogout} />
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
                                onDelete={deleteClass}
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
