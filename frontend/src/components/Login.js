import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
    const [user, setUser] = useState({
		email: "",
		password: "",
	});

	const [alert, setAlert] = useState(false);

	const onChange = (e) => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted");
        console.log(user);

        try {
            const res = await axios.post("/api/user/login", user);
            if (res.data.errors) {
                setAlert(true);
            } else {
                sessionStorage.setItem("jwtToken", JSON.stringify(res.data.token));
                console.log(res.data.token);
                console.log(res.data);
                window.location.href = "/home";
            }
        } catch (error) {
            console.error("An error occurred during login", error);
            // Implement proper error handling here
        }
    };

    return (
		<div>
			<section>
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
					<a
						href="/"
						className="flex items-center mb-6 text-7xl font-semibold text-purple-900"
					>
						Course Monitoring
					</a>
					<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl:">
								Sign in to your account
							</h1>
							{alert && (
								<div
									className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 "
									role="alert"
								>
									<span className="font-medium">
										Incorrect Email or Password!
									</span>{" "}
									Please try again.
								</div>
							)}
							<form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
								<div>
									<label
										htmlFor="email"
										className="block mb-2 text-sm font-medium text-gray-900"
									>
										Email
									</label>
									<input
										type="email"
										name="email"
										id="email"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
										placeholder="netid@tamu.edu"
										required=""
										onChange={onChange}
									/>
								</div>
								<div>
									<label
										htmlFor="password"
										className="block mb-2 text-sm font-medium text-gray-900"
									>
										Password
									</label>
									<input
										type="password"
										name="password"
										id="password"
										placeholder="••••••••"
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
										required=""
										onChange={onChange}
									/>
								</div>
								<div className="flex items-center justify-between">
									<button
										className=" block w-full bg-purple-900 text-white p-3 rounded-lg font-bolded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
										
									>
										Submit
									</button>
								</div>
								<p className="text-sm font-light text-gray-700 dark:text-gray-400">
									Don't have an account yet?{" "}
									<Link
										to="/signup"
										className="text-slate-900"
									>
										Sign up
									</Link>
								</p>
							</form>
						</div>
					</div>
					<div>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-5">
							&copy; 2023 All rights reserved. Created by Adam
							Sulemanji
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Login;


