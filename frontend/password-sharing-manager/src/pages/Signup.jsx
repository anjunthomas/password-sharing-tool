import React, { useState } from "react";

export default function Signup(){

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        encryptionKey: ""
    });

    // every input typed into an input box calls this function
    // e.target.name is the name of the input: email, password, name
    // e.target.value is the new value that was typed
    // setFormData - copies the existing form data, updates what was changed, rpaces it in the form dat state
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); // stops the page from refreshing which is default HTML behavior
        
        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.userName,
                    email: formData.email,
                    password: formData.password,
                    encryption_key: formData.encryptionKey,
                }),
            });

            const data = await response.json();

            if(response.ok){
                alert("Signup was successful!");
            } else {
                alert(`Signup failed: ${data.message}`);
            }
        } catch (error ) {
            console.error("Signup error:", error);
            alert("An error occured during signup.");
        }
    };

    return (
        <div className="form-wrapper">
            <h2> Sign Up</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <label>Name</label>
                <input 
                    name="userName" 
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Name" />    

                <label>Email</label>   
                <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email"/>
                
                <label>Password</label>
                <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="password"/>

                <label>Encryption Key</label>
                <input
                    name="encryptionKey"
                    value={formData.encryptionKey}
                    onChange={handleChange}
                    placeholder="encryptionKey"/>

                <button type="submit" className="submit-button">
                    Submit
                </button>
            </form>  
        </div>
    )
}