import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../config/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'



const SignUpForm = () => {
    const [studentNo, setStudentNo] = useState("");
    const [dept, setDept] = useState("");
    const [course, setCourse] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
  
  
    const handleSubmit = async (e) => {
      e.preventDefault();
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
          studentNo,
          dept,
          course,
          firstName,
          lastName,
          email,
        });
  
  
        console.log("Account Created and Data Stored");
      } catch (err) {
        setError(err.message);
        console.log(err);
      }
    };
  
  
    return (
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign up</h2>
          <label htmlFor="studentNo">
            Student No:
            <input type="text" onChange={(e) => setStudentNo(e.target.value)} />
          </label>
          <label htmlFor="dept">
            Department:
            <input type="text" onChange={(e) => setDept(e.target.value)} />
          </label>
          <label htmlFor="course">
            Course:
            <input type="text" onChange={(e) => setCourse(e.target.value)} />
          </label>
          <label htmlFor="firstName">
            First Name:
            <input type="text" onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label htmlFor="lastName">
            Last Name:
            <input type="text" onChange={(e) => setLastName(e.target.value)} />
          </label>
          <label htmlFor="email">
            Email:
            <input type="text" onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label htmlFor="password">
            Password:
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label htmlFor="confirmPassword">
            Confirm Password:
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button type="submit">Sign Up</button> <br />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p>
            Already Registered? <Link to="login">Login</Link>
          </p>
        </form>
      </div>
    );
  };
  
  
  export default SignUpForm;
  
  
  