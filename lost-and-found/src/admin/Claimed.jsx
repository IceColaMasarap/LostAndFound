import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase"; // Import Firebase config
import { collectionGroup, onSnapshot } from "firebase/firestore";

function Claimed() {
  const [claimedItems, setClaimedItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    // Listen for updates in the "ClaimedItems" collection
    const claimedItemsQuery = collectionGroup(db, "ClaimedItems");

    // Set up a real-time listener
    const unsubscribe = onSnapshot(claimedItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });

      setClaimedItems(items);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Function to filter items based on category, color, and date range
  const filteredItems = claimedItems.filter((item) => {
    // Match the selected category
    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(item.category)
        : categoryFilter
        ? item.category === categoryFilter
        : true; // Include all items if no filter is set

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.dateClaimed); // Assuming dateClaimed is in a valid date format
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    return matchesCategory && matchesColor && matchesDateRange;
  });

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Claimed Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <select
              className="categorybutton"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Personal Belonging">Personal Belonging</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Others">Others</option>
            </select>

            <select
              className="categorybutton"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="">All Colors</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Purple">Purple</option>
              <option value="Pink">Pink</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
            </select>

            <div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDateRange((prev) => ({
                    ...prev,
                    start: newStart,
                    end: prev.end && prev.end < newStart ? newStart : prev.end,
                  }));
                }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                min={dateRange.start} // Prevent selecting an end date earlier than the start date
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{filteredItems.length}</label>
      </div>

      <div className="containerlostdata">
        {filteredItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageUrl || placeholder}
              alt="Claimed Item"
            />
            <div className="lostitembody">
              <div className="lostitemtop">
                <label className="lostitemlabel">{item.objectName}</label>
                <div className="buttonslost">
                  <button className="lostitemimg2" id="removelostitem">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button className="lostitemimg2" id="checklostitem">
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              </div>
              <div className="lostitembody1">
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Reported by:</label>
                  <label className="lostitemlabel3">{item.reportedBy}</label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">{item.contactNumber}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.email}</label>
                  <label className="lostitemlabel2">Date Claimed</label>
                  <label className="lostitemlabel3">{item.dateClaimed}</label>
                </div>
                  
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Claimed;
