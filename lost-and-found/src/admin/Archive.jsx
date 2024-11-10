import React, { useState, useEffect } from "react";
import "./Admin.css";
import { supabase } from "../supabaseClient"; // Adjust the path accordingly
import axios from "axios";
function Archive() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showCheckboxContainer, setShowCheckboxContainer] = useState(true);

  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    category: true,
    brand: true,
    color: true,
    objectname: true,
    name: true,
    contact: true,
    email: true,
    datefound: true,
    locationfound: true,
    datelost: true,
    locationlost: true,
    status: true,
    archiveremark: true,
    archivedate: true,
    createdat: true,
  });

  const showCustomCheckbox = () => {
    setShowCheckboxContainer((prev) => !prev);
  };

  const columnLabels = {
    type: "Report Type",
    category: "Category",
    brand: "Brand",
    color: "Color",
    objectname: "Object Name",
    name: "Reported By Name",
    contact: "Reported By Contact",
    email: "Reported By Email",
    datefound: "Date Found",
    locationfound: "Location Found",
    datelost: "Date Lost",
    locationlost: "Location Lost",
    status: "Status",
    archiveremark: "Archive Reason",
    archivedate: "Date Archived",
    createdat: "Report Date"
  };

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
      objectname: true,
      name: true,
      contact: true,
      email: true,
      datefound: true,
      locationfound: true,
      datelost: false,
      locationlost: false,
      status: true,
      archiveremark: true,
      archivedate: true,
      createdat: true,
    },
    pending: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contact: true,
      email: true,
      datefound: false,
      locationfound: false,
      datelost: true,
      locationlost: true,
      status: true,
      archiveremark: true,
      archivedate: true,
      createdat: true,
    },
    claimed: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contact: true,
      email: true,
      datefound: false,
      locationfound: false,
      datelost: false,
      locationlost: false,
      status: true,
      archiveremark: true,
      archivedate: true,
      createdat: true,
    },
    all: {
      type: true,
      category: true,
      brand: true,
      color: true,
      objectname: true,
      name: true,
      contact: true,
      email: true,
      datefound: true,
      locationfound: true,
      datelost: true,
      locationlost: true,
      status: true,
      remark: true,
      archivedate: true,
      createdat: true,
    },
  };

  const deselectAllColumns = () => {
    setVisibleColumns(
      Object.keys(visibleColumns).reduce((acc, column) => {
        acc[column] = false;
        return acc;
      }, {})
    );
  };
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/get-all-items2"
        );
        setItems(response.data);
        console.log("items set:", response.data); // After setting state
      } catch (error) {
        console.error(
          "Error fetching items:",
          error.response || error.message || error
        );
      }
    };

    fetchItems();
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
    const matchesType =
      (filter === "lost" && item.type === "Lost") ||
      (filter === "pending" && item.type === "Found") ||
      (filter === "claimed" && item.status === "claimed") ||
      filter === "all";
  
    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(item.category)
        : categoryFilter
        ? item.category === categoryFilter
        : true;
  
    const matchesColor = colorFilter ? item.color === colorFilter : true;
  
    // Parsing and normalizing dates to remove the time part
    const itemDate = item.createdat ? new Date(item.createdat) : null;
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
  
    if (itemDate) itemDate.setHours(0, 0, 0, 0); // Normalize time for comparison
    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999); // Set to end of the day
  
    const matchesDateRange =
      (!startDate || itemDate >= startDate) &&
      (!endDate || itemDate <= endDate);
  
    const archive = item.status === "archived";
  
    return matchesType && matchesCategory && matchesColor && matchesDateRange && archive;
  });


  const getTypeDisplay = (type) => {
    if (filter === "pending" && type === "Found") return "Lost";
    if (filter === "pending" && type === "Lost") return "Missing";
    return type;
  };

  const formatDate = (date) => {
    if (!date) return "N/A"; // Handle null or undefined dates
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date"; // Check for invalid dates

    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();

    return `${month}/${day}/${year}`;
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Archived Reports</p>
          <div className="categoryx">
            <p>Filter</p>
            <button onClick={() => handleFilterChange("all")}>All</button>
            <button onClick={() => handleFilterChange("lost")}>Lost</button>
            <button onClick={() => handleFilterChange("pending")}>
              Missing
            </button>
            <button
              id="buttonclaimed"
              onClick={() => handleFilterChange("claimed")}
            >
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
                            <td key={column}>
                              {column === "name"
                                ? `${item.firstName} ${item.lastName}` // Combine firstname and lastname
                                : column === "type"
                                  ? getTypeDisplay(item[column])
                                  : column === "createdat"
                                    ? formatDate(item[column]) // Format the 'createdat' date
                                    : item[column] || "N/A"}
                            </td>
                          )
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={Object.keys(visibleColumns).length}>
                      No items found.
                    </td>
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

export default Archive;