import React, { useState } from "react";

export default function SharePasswordForm({ passwords, onSuccess }) {
  const [formData, setFormData] = useState({
    passwordId: "",
    recipientEmail: "",
    encryptionKey: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShare = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/passwords/share-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password_id: formData.passwordId,
        email: formData.recipientEmail,
        encryption_key: formData.encryptionKey,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Password shared successfully!");
      if (onSuccess) onSuccess();
    } else {
      alert(data.message || "Error sharing password.");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Share a Password</h3>

      <select name="passwordId" value={formData.passwordId} onChange={handleChange}>
        <option value="">Select a password</option>
        {passwords.map((pwd) => (
          <option key={pwd.id} value={pwd.id}>
            {pwd.label} ({pwd.url})
          </option>
        ))}
      </select>

      <input
        name="recipientEmail"
        placeholder="Recipient's Email"
        value={formData.recipientEmail}
        onChange={handleChange}
      />
      <input
        name="encryptionKey"
        placeholder="Your Encryption Key"
        value={formData.encryptionKey}
        onChange={handleChange}
      />
      <button onClick={handleShare}>Share</button>
    </div>
  );
}