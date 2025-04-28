import React, { useState, useEffect } from "react";
import FormInput from "../components/FormInput";

export default function Login(){

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = (e) => {
        e.preventDefault(); // stopping the page from refreshing with each change
        console.log("Login form submitted:", formData);
    }
    return (
        <div className="form-wrapper">
            <h2> Login </h2>
            <form onSubmit={handleSubmit} className="form-container">
                <label>Email</label>
                <input
                    email="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"/>

                <label>Password</label>
                <input
                    password="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"/>
            </form>
        </div>
    );
}