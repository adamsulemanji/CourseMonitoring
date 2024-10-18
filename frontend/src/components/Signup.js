import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Signup() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(false);
    const [alertResponse, setAlertResponse] = useState("");

    const [formInput, setFormInput] = useState({
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
        phone: "",
    });
  
    const onChange = (e) => {
        console.log("Form input changed");
        setFormInput({ ...formInput, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        console.log("Form submitted");
        console.log(formInput)
        e.preventDefault();

        axios.post("/api/user/register", formInput).then((res) => {
            if (res.data.errors) {
                setAlert(true);
                setAlertResponse(res.data.errors);
            } else {
                console.log(res.data);
                navigate("/login");
            }
        });
    };

    return (
        <div>
            <section className="bg-gray-50">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <Link to="/" className="flex items-center mb-6 text-7xl font-semibold text-purple-900">Course Monitoring</Link>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-2xl xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Create a new account
                            </h1>
                            {alert && (
                                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 " role="alert">
                                    <span className="font-medium">{alertResponse}</span> Please try again.
                                </div>
                            )}
                            <form className="space-y-4 md:space-y-6" action="#" onSubmit = {onSubmit}>
                                <div>
                                    <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="name@company.com" required="" onChange={onChange}></input>
                                </div>
                                <div>
                                    <label for="confirmEmail" className="block mb-2 text-sm font-medium text-gray-900">Confirm email</label>
                                    <input type="confirmEmail" name="confirmEmail" id="confirmEmail" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="name@company.com" required="" onChange={onChange}></input>
                                </div>
                                <div>
                                    <label for="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                    <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required="" onChange={onChange}></input>
                                </div>
                                <div>
                                    <label for="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">Confirm Password</label>
                                    <input type="password" name="confirmPassword" id="confirmPassword" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required="" onChange={onChange}></input>
                                </div>
                                <div>
                                    <label for="phone" className="block mb-2 text-sm font-medium text-gray-900">Phone Number</label>
                                    <input type="tel" name="phone" id="phone" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required="" onChange={onChange}></input>
                                </div>
                                <div className="flex items-center justify-between">
									<button
										className=" block w-full bg-purple-900 text-white p-3 rounded-lg font-bolded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
									>
										Submit
									</button>
								</div>
                                <p className="text-sm font-light text-gray-700 dark:text-gray-400">
                                    Already have an account? <Link to="/login" className="text-slate-900">Sign in</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
                            &copy; 2023 All rights reserved. Created by Adam Sulemanji
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
};

export default Signup;