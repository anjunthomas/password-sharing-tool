import React, { useState, useEffect } from "react";
import FormInput from "../components/AddPasswordForm";
import { Link } from 'react-router-dom';

export default function Login(){

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // stopping the page from refreshing with each change
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if(response.ok){

                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                alert(`Login successful. Hello, ${data.name}!`);

                window.location.href = "/passwordShare";
            } else {
                alert(`Login failed: ${data.message}`);
            }
        } catch (error ) {
            console.error("Login error:", error);
            alert("An error occured during Login.");
        }
    }
    return (
        <div className="form-wrapper">
            <h2> Login </h2>
            <form onSubmit={handleSubmit} className="form-container">
                <label>Email</label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"/>

                <label>Password</label>
                <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"/>
                <button type="submit" className="submit-button">
                    Submit
                </button>
            </form>

            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
    );
}