import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/firebase"; // Import Supabase instance
import "../styling/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Authenticate the user with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      const user = signInData.user;

      // Check if user exists
      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Retrieve user data from the "users" table using user.id
      const { data: userData, error: supabaseError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id) // Use user.id for accurate matching
        .single();

      if (supabaseError) {
        throw new Error("Error fetching user data from Supabase.");
      }

      // Check the "is_admin" field and navigate accordingly
      if (userData.is_admin) {
        navigate("/adminpage");
      } else {
        navigate("/homepage");
      }
    } catch (err) {
      setError(err.message);
      console.log("Error logging in:", err);
    }
  };

  const goToRegister = () => {
    navigate("/"); // Navigate to register page
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
