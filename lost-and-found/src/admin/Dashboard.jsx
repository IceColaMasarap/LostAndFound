import "./Admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Import your Supabase client
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function Dashboard() {
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");
  const [foundItems, setFoundItems] = useState([]);
  const [userData, setUserData] = useState(null); // Store user data here

  // Retrieve user data from sessionStorage
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user) {
      setUserData({
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        contactNumber: user.contact,
        userId: user.id, // Assuming the user object contains the userId
      });
    } else {
      console.log("No user data found in sessionStorage.");
    }
  }, []);

  const handleCodeInput = (e) => {
    setInputCode(e.target.value);
  };

  // Fetch item based on code from Supabase
  const fetchItem = async () => {
    try {
      // Use axios to make a GET request to your Express backend
      const response = await axios.get(`http://localhost:3001/api/item-by-code/${inputCode}`);
      const data = response.data;
  
      // Check if the item exists and is not confirmed
      if (data && !data.confirmed) {
        await confirmItem(data.id); // Confirm the item if not already confirmed
        toast.success("Reported found item confirmed successfully!");
      } else if (data && data.confirmed) {
        toast.info("This item has already been confirmed.");
      } else {
        toast.warning("No matching item found for the given code.");
      }
  
      setInputCode(""); // Reset the input field
    } catch (error) {
      console.error("Error fetching item:", error);
      toast.error("Error fetching item. Please try again.");
    }
  };
  
  

  // Function to confirm the item

const confirmItem = async (itemId) => {
  try {
    // Use axios to make a PUT request to your Express backend
    const response = await axios.put(`http://localhost:3001/api/confirm-item/${itemId}`);

    if (!response.status === 200) {
      toast.error("Error confirming the item. Please try again.");
    }
  } catch (error) {
    console.error("Error confirming item:", error);
    toast.error("Error confirming the item. Please try again.");
  }
};
  

  // Fetch all found items on mount
  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/get-found-items"
        );
        setFoundItems(response.data);
      } catch (error) {
        console.error("Error fetching found items: ", error);
      }
    };
    fetchFoundItems();
  }, []);


  // Count the items based on their status
  const lostItemsCount = foundItems.filter(
    (item) => item.status === "pending" && item.type === "Found"
  ).length;

  const pendingClaimsCount = foundItems.filter(
    (item) => item.status === "pending" && item.type === "Lost"
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {foundItems.length > 0 ? (
                  foundItems
                    .filter((item) => item.status) // Filter out items without status
                    .sort(
                      (a, b) => new Date(b.createdat) - new Date(a.createdat)
                    )

                    .map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.firstname && item.lastname
                            ? `${item.firstname} ${item.lastname}`
                            : "N/A"}
                        </td>
                        <td>{item.category}</td>
                        <td>{item.objectname}</td>
                        <td>
                          {item.createdat
                            ? new Date(item.createdat).toLocaleString() // Convert string to Date for display
                            : "N/A"}
                        </td>
                        <td>{item.type}</td>
                        <td>{item.status}</td>
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
