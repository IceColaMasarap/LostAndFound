import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs"; // Import bcrypt
import axios from "axios"; // Use axios for making HTTP requests
import "../styling/login.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }

    try {
      // Send a POST request to the login endpoint
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      const data = response.data;
      console.log("User data from backend:", data);

      // Store user data in sessionStorage (excluding sensitive info like password)
      sessionStorage.setItem("user", JSON.stringify(data));

      // Redirect based on user role
      if (data.is_admin) {
        navigate("/adminpage");
      } else {
        navigate("/homepage");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred during login");
      }
      console.log("Error logging in:", err);
    }
  };

  const goToRegister = () => {
    navigate("/"); // Navigate to register route
  };

  return (
    <div className="signup-container">
      <h1>LOST AND FOUND</h1>
      <div className="buttons">
        <button
          style={{
            backgroundColor: "white",
            color: "#36408e",
            border: "none",
            opacity: 1, // Keep opacity consistent
            cursor: "not-allowed", // Change cursor to indicate disabled state
            pointerEvents: "none", // Disable interaction
          }}
        >
          Login
        </button>
        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "none",
          }}
          id="register"
          onClick={goToRegister}
        >
          Register
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <label id="signxup">Log in with your Account</label>
        <div className="emails">
          <input
            type="text"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="passwords">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit">Sign In</button> <br />
        {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error */}
      </form>
    </div>
  );
};

export default Login;
