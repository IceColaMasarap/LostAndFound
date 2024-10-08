import "./Admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import {
  setDoc,
  collectionGroup,
  collection,
  query,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Dashboard() {
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");
  const [foundItems, setFoundItems] = useState([]);

  const handleCodeInput = (e) => {
    setInputCode(e.target.value);
  };

  const fetchItem = async () => {
    try {
      const foundItemsQuery = query(
        collectionGroup(db, "FoundItems"),
        where("code", "==", inputCode)
      );
      const querySnapshot = await getDocs(foundItemsQuery);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        const data = docSnapshot.data();
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

  const confirmItem = async (docRef) => {
    try {
      setInputCode("");
      await setDoc(docRef, { confirmed: true }, { merge: true });
    } catch (error) {
      console.error("Error updating confirmation status:", error);
      toast.error("Error confirming the item. Please try again.");
    }
  };

  useEffect(() => {
    // Listen for updates in the "lostItems" collection
    const foundItemsQuery = collectionGroup(db, "FoundItems");

    // Set up a real-time listener
    const unsubscribe = onSnapshot(foundItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const userName = data.userDetails?.name || "N/A"; // Access userDetails.name

        return {
          id: doc.id,
          ...data,
          userName, // Add the userName to the item object
        };
      });

      setFoundItems(items);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

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
                {foundItems.length > 0 ? (
                  foundItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.userName}</td> {/* Display the user's name */}
                      <td>{item.category}</td>
                      <td>{item.objectName}</td>
                      <td>
                        {item.createdAt
                          ? item.createdAt.toDate().toLocaleString()
                          : "N/A"}
                      </td>
                      <td>{item.confirmed ? "Claimed" : "Pending"}</td>
                      <td>{item.confirmed ? "Claimed" : "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Dashboard;
