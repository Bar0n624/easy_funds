import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/styles.css";

export default function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:5000/login", { "username": name, "password": password });

            if (response.status === 200) {
                const uid = response.data.user_id;
                alert("Login successful");
                navigate('/home', { state: { uid } });
            } else {
                throw new Error("Login failed!");
            }
        } catch (error) {
            alert("An error occurred!");
            setName("");
            setPassword("");
            console.error('Error:', error);
        }
    };

    return (
        <div className="wrapper signIn">
            <div className="illustration">
                {/*<img src="https://source.unsplash.com/random" alt="illustration" />*/}
            </div>
            <div className="form">
                <div className="heading">LOGIN</div>
                <form onSubmit={handleOnSubmit}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
                <p>
                    Don't have an account? <Link to="/signup"> Sign Up </Link>
                </p>
            </div>
        </div>
    );
}
