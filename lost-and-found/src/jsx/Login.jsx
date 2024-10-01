import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); // Use navigate hook for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Successfully");
            navigate('/homepage');// Trigger redirection to /admin
        } catch (err) {
            setError(err.message); // Handle error
            console.log(err);
        }
    };

    return (
        <div className='signup-container'>
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <label htmlFor="email">
                    Email:
                    <input type="text" onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label htmlFor="password">
                    Password:
                    <input type="password" onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </label>

                <button type='submit'>Sign In</button> <br />

                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error */}

                <p>Don't have an account? <Link to="/">Sign up</Link></p>
            </form>
        </div>
    );
};

export default Login;
