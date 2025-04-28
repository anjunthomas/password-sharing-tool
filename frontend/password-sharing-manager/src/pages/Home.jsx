import React from "react";
// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    
    <div className="tabs">
        <Link to="/signup">SignUp</Link>
        <Link to="/login">Login</Link>
        <Link to="/passwordsharing">Password Share Manager</Link>
    </div>
  );
}