import React, { useState } from "react";

export default function AddPasswordForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        label: "",
        url: "",
        username: "",
        password: "",
        encryptionKey: "",
});

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/passwords/save", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                label: formData.label,
                url: formData.url,
                username: formData.username,
                password: formData.password,
                encryption_key: formData.encryptionKey,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Password saved successfully!");
            if (onSuccess) onSuccess(); // Optional: trigger reload
        } else {
            alert(data.error || "Something went wrong.");
        }
        } catch (err) {
        console.error("Save error:", err);
        alert("Server error occurred.");
        }
    };

    return (
        <div style={{ marginTop: "30px" }}>
        <h3>Add a New Password</h3>
        <input name="label" placeholder="Label" onChange={handleChange} />
        <input name="url" placeholder="URL" onChange={handleChange} />
        <input name="username" placeholder="Username" onChange={handleChange} />
        <input name="password" placeholder="Password" onChange={handleChange} />
        <input name="encryptionKey" placeholder="Encryption Key" onChange={handleChange} />
        <button onClick={handleSave}>Save Password</button>
        </div>
    );
}
