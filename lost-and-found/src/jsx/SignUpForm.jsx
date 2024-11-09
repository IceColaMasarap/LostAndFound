import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styling/login.css";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/register", {
        firstName,
        lastName,
        email,
        contact,
        password,
      });

      setSuccessMessage(response.data.message);
      setTimeout(() => navigate("/login"), 2000); // Redirect to login after success
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Error occurred during registration"
      );
      console.log(err);
    }
  };

  return (
    <div className="signup-container">
      <h1>LOST AND FOUND</h1>
      <div className="buttons">
        <button
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "none",
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          style={{
            backgroundColor: "white",
            color: "#36408e",
            border: "none",
            opacity: 1,
            cursor: "not-allowed",
            pointerEvents: "none",
          }}
        >
          Register
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <label id="signup">Create a new Account</label>
        <div className="names">
          <input
            type="text"
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Contact Number"
            maxLength={11}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <div className="emails">
          <input
            type="email"
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
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit">Sign Up</button>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "#15bc11" }}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
