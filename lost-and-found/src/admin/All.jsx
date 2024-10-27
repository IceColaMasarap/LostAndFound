import React, { useState, useEffect } from "react";
import "./Admin.css";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase"; // Firebase config

function All() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all"); // Default filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showCheckboxContainer, setShowCheckboxContainer] = useState(true);

  // Columns state to manage visibility
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    category: true,
    brand: true,
    color: true,
    objectName: true,
    name: true,
    contactNumber: true,
    email: true,
    dateFound: true,
    locationFound: true,
    dateLost: true,
    locationLost: true,
    claimedBy: true,
    claimEmail: true,
    claimContactNumber: true,
    dateClaimed: true,
    status: true,
  });
  const showCustomCheckbox = () => {
    setShowCheckboxContainer((prev) => !prev);
  };
  // Mapping for column display names
  const columnLabels = {
    type: "Report Type",
    category: "Category",
    brand: "Brand",
    color: "Color",
    objectName: "Object Name",
    name: "Reported By Name",
    contactNumber: "Reported By Contact",
    email: "Reported By Email",
    dateFound: "Date Found",
    locationFound: "Location Found",
    dateLost: "Date Lost",
    locationLost: "Location Lost",
    claimedBy: "Claimer's Name",
    claimEmail: "Claimer's Email",
    claimContactNumber: "Claimer's Contact",
    dateClaimed: "Date Claimed",
    status: "Status",
  };
  // Select all columns
  const selectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = true;
        return acc;
      }, {})
    );
  };
  const columnVisibilitySettings = {
    lost: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectName: true,
      name: true,
      contactNumber: true,
      email: true,
      dateFound: true,
      locationFound: true,
      dateLost: false,
      locationLost: false,
      claimedBy: false,
      claimEmail: false,
      claimContactNumber: false,
      dateClaimed: false,
      status: true,
    },
    pending: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectName: true,
      name: true,
      contactNumber: true,
      email: true,
      dateFound: false,
      locationFound: false,
      dateLost: true,
      locationLost: true,
      claimedBy: false,
      claimEmail: false,
      claimContactNumber: false,
      dateClaimed: false,
      status: true,
    },
    claimed: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectName: true,
      name: true,
      contactNumber: true,
      email: true,
      dateFound: false,
      locationFound: false,
      dateLost: false,
      locationLost: false,
      claimedBy: true,
      claimEmail: true,
      claimContactNumber: true,
      dateClaimed: true,
      status: true,
    },
    all: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectName: true,
      name: true,
      contactNumber: true,
      email: true,
      dateFound: true,
      locationFound: true,
      dateLost: true,
      locationLost: true,
      claimedBy: true,
      claimEmail: true,
      claimContactNumber: true,
      dateClaimed: true,
      status: true,
    },
  };

  // Deselect all columns
  const deselectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = false;
        return acc;
      }, {})
    );
  };
  useEffect(() => {
    const itemsQuery = collectionGroup(db, "itemReports");

    const unsubscribe = onSnapshot(itemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckboxChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    setVisibleColumns(columnVisibilitySettings[selectedFilter]);
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;

    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(
            item.category
          )
        : categoryFilter
        ? item.category === categoryFilter
        : true;

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.createdAt);
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    // Only include items where confirmed is not false
    const isConfirmed = item.confirmed !== false;

    return (
      matchesStatus &&
      matchesCategory &&
      matchesColor &&
      matchesDateRange &&
      isConfirmed // Ensure only confirmed items are included
    );
  });

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">All Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <button onClick={() => handleFilterChange("all")}>All</button>
            <button onClick={() => handleFilterChange("lost")}>Lost</button>
            <button onClick={() => handleFilterChange("pending")}>
              Missing
            </button>
            <button onClick={() => handleFilterChange("claimed")}>
              Claimed
            </button>
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

            <div className="dateDiv">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
              />
              <label className="tolabel">–</label>

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>

        <label className="adminh2">{filteredItems.length}</label>
      </div>
      <div className="showCheckbox">
        <p>Select Columns:</p>
        <div className="checkbox-buttons">
          <button onClick={selectAllColumns}>Select All</button>
          <button onClick={deselectAllColumns}>Deselect All</button>
          <button className="togglev" onClick={showCustomCheckbox}>
            Toggle
          </button>{" "}
        </div>
      </div>

      {showCheckboxContainer && (
        <div className="checkbox-container">
          {Object.keys(visibleColumns).map((column) => (
            <div key={column}>
              <input
                type="checkbox"
                checked={visibleColumns[column]}
                onChange={() => handleCheckboxChange(column)}
              />
              <label>{columnLabels[column]}</label>
            </div>
          ))}
        </div>
      )}
      <div className="dashboardbody">
        <div className="dashboardtable">
          <div className="table-containerAll">
            <table className="report-table">
              <thead>
                <tr>
                  {Object.keys(visibleColumns).map(
                    (column) =>
                      visibleColumns[column] && (
                        <th key={column}>{columnLabels[column]}</th>
                      )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      {Object.keys(visibleColumns).map(
                        (column) =>
                          visibleColumns[column] && (
                            <td key={column}>{item[column] || "N/A"}</td>
                          )
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="18">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default All;
