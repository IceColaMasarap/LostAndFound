import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Import setDoc and doc
import { db } from "../config/firebase"; // Ensure you import Firestore instance
import "../styling/login.css";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Add this line

  const navigate = useNavigate(); // Use navigate hook for redirection

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
      return; // Stop the form submission if any field is empty
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store additional details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        contact,
      });

      console.log("Account Created and Data Stored");
      setSuccessMessage("Account Created Sucessfully!"); // Update this line
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  };

  const goToRegister = () => {
    navigate("/login"); // Navigate to ./register route
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
          onClick={goToRegister}
        >
          Login
        </button>
        <button
          style={{
            backgroundColor: "white",
            color: "#36408e",
            border: "none",
          }}
          disabled={true}
        >
          Register
        </button>
      </div>

      <form className="signup-form" onSubmit={handleSubmit}>
        <label id="signxup">Create a new Account</label>
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
            type="email" // Use 'email' for better validation
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
