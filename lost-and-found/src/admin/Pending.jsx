import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase"; // Import Firebase config
import { collectionGroup, onSnapshot } from "firebase/firestore";

function Pending() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    // Listen for updates in the "lostItems" collection
    const foundItemsQuery = collectionGroup(db, "lostItems");

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

  // Function to filter items based on category, color, and date range
  const filteredItems = foundItems.filter((item) => {
    // Match the selected category
    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(
            item.category
          ) // Exclude specific categories
        : categoryFilter
        ? item.category === categoryFilter // Match selected category
        : true; // If no category filter, include all items

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.dateFound); // Assuming dateFound is in a valid date format
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    return matchesCategory && matchesColor && matchesDateRange;
  });

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Pending Claims</p>
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
              {/* Add more categories as needed */}
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
              {/* Add more colors as needed */}
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
                    end: prev.end < newStart ? newStart : prev.end, // Update end date if necessary
                  }));
                }}
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                min={dateRange.start} // Set the minimum date to the selected start date
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{filteredItems.length} </label>
      </div>

      <div className="containerlostdata">
        {filteredItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageUrl || placeholder}
              alt="Lost Item"
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
                  <label className="lostitemlabel3">
                    {item.userDetails?.name}
                  </label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">
                    {item.userDetails?.contactNumber}
                  </label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">
                    {item.userDetails?.email}
                  </label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Found</label>
                  <label className="lostitemlabel3">
                    {item.dateFound} at {item.timeFound}
                  </label>
                  <label className="lostitemlabel2">Location Found</label>
                  <label className="lostitemlabel3">{item.locationFound}</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Pending;
