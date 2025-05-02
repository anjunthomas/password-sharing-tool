import React, { useState } from "react";
import AddPasswordForm from "../components/AddPasswordForm";
import SharePasswordForm from "../components/SharePasswordForm";
import "../styles/PasswordShare.css";

export default function PasswordShare(){

    const [encryptionKey, setEncryptionKey] = useState("");
    const [passwords, setPasswords] = useState([]);
    const userName = localStorage.getItem("name");

    async function fetchPasswords() {
        const token = localStorage.getItem("token"); // assuming you're storing JWT here
      
        const response = await fetch("http://localhost:5000/passwords/list", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ encryption_key: encryptionKey }),
        });
      
        const data = await response.json();
        if (response.ok) {
            setPasswords(data.data);
        } else {
            alert(data.message);
        }
    }

        return (
            <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
                <h2>Hello {userName}</h2>
                <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>
                    Logout
                </button>

                <AddPasswordForm onSuccess={fetchPasswords} />

                <SharePasswordForm passwords={passwords} onSuccess={fetchPasswords} />

        
                <div style={{ marginTop: "20px" }}>
                    <label>Encryption Key</label>
                    <input
                        type="password"
                        value={encryptionKey}
                        onChange={(e) => setEncryptionKey(e.target.value)}
                    />
                <button onClick={fetchPasswords}>Show Saved Passwords</button>
            </div>
        
            <table border="1" style={{ marginTop: "20px", width: "100%" }}>
                <thead>
                <tr>
                    <th>Label</th>
                    <th>URL</th>
                    <th>Username</th>
                    <th>Masked Password</th>
                    <th>Shared By</th>
                </tr>
                </thead>
                <tbody>
                {passwords.map((entry) => (
                    <tr key={entry.id}>
                    <td>{entry.label}</td>
                    <td>{entry.url}</td>
                    <td>{entry.username}</td>
                    <td>*****</td>
                    <td>{entry.SharedBy ? entry.SharedBy.name : "—"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        );
    }