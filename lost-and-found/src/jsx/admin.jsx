import React, { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

function Admin() {
  const [foundItem, setFoundItem] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [message, setMessage] = useState(''); // For the confirmation message

  const navigate = useNavigate();

  // Fetch the correct document from Firestore using the code and confirm it
  const fetchItem = async () => {
    try {
      const docRef = doc(db, "FoundItems", inputCode); 
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFoundItem(data);

        // Automatically confirm the item (set confirmed to true)
        await confirmItem(docRef);
      } else {
        console.error("No matching document found!");
        setMessage("No matching item found for the given code.");
      }
    } catch (error) {
      console.error("Error fetching document: ", error);
      setMessage("Error fetching item. Please try again.");
    }
  };

  // Confirm the item and update the Firestore document
  const confirmItem = async (docRef) => {
    try {
      await setDoc(docRef, { confirmed: true }, { merge: true });
      setMessage("Reported found item received successfully!");
    } catch (error) {
      console.error("Error updating confirmation status:", error);
      setMessage("Error confirming the item. Please try again.");
    }
  };

  const handleCodeInput = (e) => {
    setInputCode(e.target.value);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <label htmlFor="code">Enter Code:</label>
      <input
        type="text"
        id="code"
        value={inputCode}
        onChange={handleCodeInput}
        required
      />
      <button onClick={fetchItem}>Confirm Code</button>

      {message && (
        <div>
          <p>{message}</p>
        </div>
      )}

  

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Admin;
