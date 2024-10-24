import React, { useState } from 'react'
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js'

// Define your Cognito User Pool details
const poolData = {
    UserPoolId: 'us-east-1_OjUVi5IAI', // Replace with your User Pool ID
    ClientId: '4ndqe4ft3kej4g7lbhn8u5r7a1', // Replace with your App Client ID
}

const userPool = new CognitoUserPool(poolData)

function VerifyEmail() {
    const [email, setEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [message, setMessage] = useState('')

    const handleVerification = () => {
        const user = new CognitoUser({
            Username: email,
            Pool: userPool,
        })

        user.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                setMessage(`Verification failed: ${err.message}`)
                return
            }
            setMessage('Verification successful! You can now sign in.')
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <button
                    onClick={handleVerification}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Verify Email
                </button>

                {message && <p className="mt-4 text-red-500">{message}</p>}
            </div>
        </div>
    )
}

export default VerifyEmail
