import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, supabase } from "../config/firebase"; // Firebase imports
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import the uuid generator
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

    if (!firstName || !lastName || !email || !contact || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Send email verification
      await sendEmailVerification(user);
      setSuccessMessage("Verification email sent! Please verify your email to complete registration.");

      // Step 3: Check email verification status in real-time
      const checkVerification = setInterval(async () => {
        await user.reload(); // Refresh user’s data from Firebase
        if (user.emailVerified) {
          clearInterval(checkVerification); // Stop checking once verified

          // Store user details in Firebase Firestore
          await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email,
            contact,
          });

          // Generate a UUID for Supabase and insert user data
          const uuid = uuidv4();
          const { data, error: supabaseError } = await supabase
            .from("users")
            .insert([
              {
                firebase_uid: user.uid,
                firstName: firstName,
                lastName: lastName,
                email: email,
                contact: contact,
              },
            ]);

          if (supabaseError) {
            throw new Error(supabaseError.message);
          }

          console.log("Data stored in Supabase");
          setSuccessMessage("Account created successfully!");
          setTimeout(() => navigate("/login"), 2000);
        }
      }, 2000); // Check every 2 seconds
    } catch (err) {
      setError(err.message);
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
            opacity: 1, // Keep opacity consistent
            cursor: "not-allowed", // Change cursor to indicate disabled state
            pointerEvents: "none", // Disable interaction
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
