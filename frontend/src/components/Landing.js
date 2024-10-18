import { Link } from 'react-router-dom';
import React from 'react';


function Landing() {
    return (
        <div>
            {/* style the landing page and make a link to the sign in page using tailwind*/}
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <a
                        href="/"
                        className="flex items-center mb-6 text-7xl font-semibold text-purple-900"
                    >
                        Course Monitoring
                    </a>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                
                            <div className="p-4 mb-4 text-sm rounded-lg bg-purple-50 flex items-center justify-center" role="alert">
                                <span className="font-medium">
                                    This is where the courses list will be displayed
                                </span>
                            </div>
                            <Link to="/login">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center w-full px-4 py-2 mt-4 font-medium text-white bg-purple-900 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 sm:px-6"
                                >
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;