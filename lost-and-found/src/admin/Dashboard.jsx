import "./Admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react"; // Ensure useState is imported from React
import {
  setDoc,
  collectionGroup,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");

  const handleCodeInput = (e) => {
    setInputCode(e.target.value);
  };

  // Fetch the correct document by querying for inputCode across all users
  const fetchItem = async () => {
    try {
      // Use collectionGroup to search across all "FoundItems" subcollections
      const foundItemsQuery = query(
        collectionGroup(db, "FoundItems"),
        where("code", "==", inputCode) // Match the input code
      );
      const querySnapshot = await getDocs(foundItemsQuery);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const data = docSnapshot.data();

        // Automatically confirm the item (set confirmed to true)
        await confirmItem(docSnapshot.ref);
        toast.success("Reported found item received successfully!");
      } else {
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
      setInputCode("");
      await setDoc(docRef, { confirmed: true }, { merge: true });
    } catch (error) {
      console.error("Error updating confirmation status:", error);
      toast.error("Error confirming the item. Please try again.");
    }
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Dashboard</p>
          <p>Welcome to NU Lost and Found!</p>
        </div>
        <div>
          <input
            className="entercode"
            maxLength={6}
            placeholder="ENTER CODE"
            value={inputCode}
            onChange={handleCodeInput}
          />
          <button className="codebtn" id="entercodebtn" onClick={fetchItem}>
            <FontAwesomeIcon icon={faCheck} />
          </button>
        </div>
      </div>
      <div className="dashboardbody">
        <div className="panels">
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Lost Items</p>
          </div>
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Pending Claims</p>
          </div>
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Claimed Items</p>
          </div>
        </div>

        <div className="dashboardtable">
          <p className="ptag">Displaying Most Recent Lost Items</p>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Reported By</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Claimed By</th>
                </tr>
              </thead>
              <tbody>
                {/* Add your data rows here */}
                <tr>
                  <td>John Doe</td>
                  <td>Lost Item</td>
                  <td>Umbrella</td>
                  <td>2024-10-01</td>
                  <td>Pending</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>Found Item</td>
                  <td>Backpack</td>
                  <td>2024-10-02</td>
                  <td>Claimed</td>
                  <td>John Doe</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer /> {/* Add the ToastContainer to render the toasts */}
    </>
  );
}

export default Dashboard;
