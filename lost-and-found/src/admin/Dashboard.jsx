import "./Admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import {
  setDoc,
  collectionGroup,
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
        collectionGroup(db, "itemReports"),
        where("code", "==", inputCode)
      );
      const querySnapshot = await getDocs(foundItemsQuery);

      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
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
    const foundItemsQuery = collectionGroup(db, "itemReports");

    const unsubscribe = onSnapshot(foundItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const userName = data.userDetails?.name || "N/A"; // Access userDetails.name

        return {
          id: doc.id,
          ...data,
          userName,
        };
      });

      setFoundItems(items);
    });

    return () => unsubscribe();
  }, []);

  // Count the items based on their status
  const lostItemsCount = foundItems.filter(
    (item) => item.status === "lost"
  ).length;
  const pendingClaimsCount = foundItems.filter(
    (item) => item.status === "pending"
  ).length;
  const claimedItemsCount = foundItems.filter(
    (item) => item.status === "claimed"
  ).length;

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
            <p id="lostitemcount" className="panelh2">
              {lostItemsCount}
            </p>
            <p className="panelp">Lost Items</p>
          </div>
          <div className="panel">
            <p id="pendingclaimcount" className="panelh2">
              {pendingClaimsCount}
            </p>
            <p className="panelp">Pending Claims</p>
          </div>
          <div className="panel">
            <p id="claimeditemscount" className="panelh2">
              {claimedItemsCount}
            </p>
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
                  <th>Object Name</th>
                  <th>Reported Date</th>
                  <th>Type</th>
                  <th>Claimed By</th>
                </tr>
              </thead>
              <tbody>
                {foundItems.length > 0 ? (
                  foundItems
                    .filter((item) => item.status) // Filter out items without status
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    ) // Sort in descending order by date
                    .slice(0, 5) // Limit to 5 rows
                    .map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.objectName}</td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString() // Convert string to Date for display
                            : "N/A"}
                        </td>
                        <td>
                          {item.status === "lost"
                            ? "Lost"
                            : item.status === "pending"
                            ? "Missing"
                            : item.status === "claimed"
                            ? "Claimed"
                            : "N/A"}
                        </td>
                        <td>{item.claimedBy ? item.claimedBy : "N/A"}</td>
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
