import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "./firebase"; // Import Firestore instance from firebase.js

import "../styling/login.css";

const FetchUserRole = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Reference to the specific document in the 'users' collection
        const docRef = doc(db, "users", "4skSWo0Ld2YnIZG1hGRaNQd3Kg72");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Accessing the 'Role' field from the document
          const userData = docSnap.data();
          setRole(userData.Role); // Set the role value in state
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Role: {role}</h1>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Use navigate hook for redirection
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login Successfully");

      // Check if the email and password match the admin credentials
      if (email === "admin@gmail.com" && password === "admin123") {
        navigate("/adminpage"); // Redirect to admin page
      } else {
        navigate("/homepage"); // Redirect to usual page
      }
    } catch (err) {
      setError(err.message); // Handle error
      console.log(err);
    }
  };

  const goToRegister = () => {
    navigate("/"); // Navigate to ./register route
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
