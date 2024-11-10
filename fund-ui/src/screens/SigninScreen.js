import React from "react";
import "../styles/styles.css";
import { Link } from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import axios from "axios";

export default function Signup() {
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [password_confirm, setConfirm] = React.useState("");
    const navigate = useNavigate();

    const handleOnSubmit = async (e) => {
        e.preventDefault();

        if (password !== password_confirm) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/register", { username: name, password: password });

            if (response.status === 201) {
                const uid = response.data.user_id;
                console.log(uid);
                alert("User registered successfully");
                navigate('/home', { state: { uid } });
            } else {
                throw new Error(response.statusText || "Registration failed!");
            }
        } catch (error) {
            alert("An error occurred!");
            setPassword("");
            setConfirm("");
            setName("");
            console.error('Error:', error);
        }
    };



    return (
        <div className="wrapper signUp">
            <div className="illustration">
                {/*<img src="https://source.unsplash.com/random" alt="illustration" />*/}
            </div>
            <div className="form">
                <div className="heading">CREATE AN ACCOUNT</div>
                <form>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Confirm Password</label>
                        <input
                            type="password"
                            id="password_confirm"
                            placeholder="Confirm password"
                            value={password_confirm} onChange={(e) => setConfirm(e.target.value)}
                        />
                    </div>
                    <button type="submit" onClick={handleOnSubmit}>Submit</button>
                    <h2 align="center" class="or">
                        OR
                    </h2>
                </form>
                <p>
                    Have an account ? <Link to="/"> Login </Link>
                </p>
            </div>
        </div>
    );
}
