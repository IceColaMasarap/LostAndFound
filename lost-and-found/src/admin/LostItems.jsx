import React, { useEffect, useState } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive, faCheck } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function LostItems() {
  const [reports, setReports] = useState([]); // State to store fetched data
  const [filteredReports, setFilteredReports] = useState([]); // State to store filtered reports
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [remark, setArchiveRemark] = useState("");
  const [claimerDetails, setClaimerDetails] = useState({
    claimedBy: "",
    claimContactNumber: "",
    claimEmail: "",
  });
  const fetchItems = () => {
    axios
      .get("http://localhost:3001/api/founditem-reports")
      .then((response) => {
        setReports(response.data); // Update state with the fetched data
        setFilteredReports(response.data); // Initially show all reports
      })
      .catch((error) => {
        setError(error.message); // Handle error
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    // Call the fetchItems function when the component mounts
    fetchItems();
  }, []);

  // Filter reports based on the selected filters
  useEffect(() => {
    let filtered = [...reports]; // Start with the reports data

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Filter by color
    if (colorFilter) {
      filtered = filtered.filter((item) => item.color === colorFilter);
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.datefound); // Assuming item.datefound is a valid date string
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredReports(filtered); // Update filtered reports state
  }, [categoryFilter, colorFilter, dateRange, reports]); // Re-run the filter whenever any filter changes

  // Handle archiving the item
  const handleArchiveItem = async () => {
    if (!currentItemId || !remark.trim()) return; // Ensure itemId and remark are provided

    try {
      // Update the status of the item in the backend
      await axios.put(`http://localhost:3001/api/archive-item/${currentItemId}`, {
        status: "archived",
      });

      // Insert the item into the archived_items table
      await axios.post("http://localhost:3001/api/add-to-archived", {
        item_id: currentItemId, // Ensure this uses the correct ID
        archiveremark: remark,
        archivedate: new Date().toISOString(),
      });

      // Remove the archived item from the local state
      setReports(reports.filter((item) => item.id !== currentItemId));
      setFilteredReports(filteredReports.filter((item) => item.id !== currentItemId));
      setShowRemoveModal(false); // Close the modal
      setArchiveRemark(""); // Clear the remark input
      console.log("Item archived successfully.");
    } catch (error) {
      console.error("Error archiving item:", error);
    }
  };

  

  // Handle claiming the item
  const handleClaimItem = () => {
    console.log("Current Item ID (Claim):", currentItemId); // Log to see the ID
    const { claimedBy, claimContactNumber, claimEmail } = claimerDetails;

    if (!claimedBy.trim() || !claimContactNumber.trim() || !claimEmail.trim()) {
      return; // Exit if any claim detail is missing
    }

    // Send claim details to backend
    axios
      .post("http://localhost:3001/api/set-claimed-items", {
        itemId: currentItemId,
        claimedBy,
        claimEmail,
        claimContactNumber,
      })
      .then((response) => {
        console.log(response.data.message);
        setShowClaimModal(false); // Close the modal
        fetchItems();
        setClaimerDetails({
          claimedBy: "",
          claimContactNumber: "",
          claimEmail: "",
        }); // Reset the form fields
      })
      .catch((error) => {
        console.error("Error claiming item:", error);
        alert("Failed to claim item.");
      });
  };
  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Found Item Reports</p>
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
              <option value="Other">Others</option>
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
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDateRange((prev) => ({
                    ...prev,
                    start: newStart,
                    end: prev.end < newStart ? newStart : prev.end,
                  }));
                }}
              />
              <label className="tolabel">–</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{filteredReports.length}</label>{" "}
        {/* Display count of filtered reports */}
      </div>

      <div className="containerlostdata">
        {filteredReports.length === 0 ? ( // Show loading or no data message if no filtered reports
          <p>No items found</p>
        ) : (
          filteredReports.map((item) => (
            <div key={item.id} className="lostitemcontainer">
              <img
                className="lostitemimg"
                src={item.imageurl || placeholder}
                alt="Lost Item"
              />
              <div className="lostitembody">
                <div className="lostitemtop">
                  <label className="lostitemlabel">{item.objectname}</label>
                  <div className="buttonslost">
                    <button
                      className="lostitemimg2"
                      id="removelostitem"
                      onClick={() => {
                        setCurrentItemId(item.id);
                        setShowRemoveModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faBoxArchive} />
                    </button>
                    <button
                      className="lostitemimg2"
                      id="checklostitem"
                      onClick={() => {
                        setShowClaimModal(true);
                        // Directly pass the item ID to the claim handler
                        setCurrentItemId(item.id);
                      }}
                    >
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
                      {item.firstName} {item.lastName}
                    </label>
                    <label className="lostitemlabel2">Contact Number</label>
                    <label className="lostitemlabel3">{item.contact}</label>
                    <label className="lostitemlabel2">Email</label>
                    <label className="lostitemlabel3">{item.email}</label>
                  </div>
                  <div className="lostitempanel2">
                    <label className="lostitemlabel2">Date Found</label>
                    <label className="lostitemlabel3">
                      {new Date(item.datefound).toLocaleDateString("en-US")} at{" "}
                      {item.timefound}
                    </label>
                    <label className="lostitemlabel2">Location Found</label>
                    <label className="lostitemlabel3">
                      {item.locationfound}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Archive this item?</p>
            <input
              placeholder="Archive Reason"
              value={remark}
              onChange={(e) => setArchiveRemark(e.target.value)}
            />
            <div className="modalBtnDiv">
              <button onClick={handleArchiveItem} disabled={!remark.trim()}>
                Yes
              </button>
              <button onClick={() => setShowRemoveModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Claim Item</h2>
            <label>Claimed By:</label>
            <input
              type="text"
              value={claimerDetails.claimedBy}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimedBy: e.target.value,
                })
              }
              required
            />
            <label>Contact Number:</label>
            <input
              type="number"
              value={claimerDetails.claimContactNumber}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimContactNumber: e.target.value,
                })
              }
              required
            />
            <label>Email:</label>
            <input
              type="email"
              value={claimerDetails.claimEmail}
              onChange={(e) =>
                setClaimerDetails({
                  ...claimerDetails,
                  claimEmail: e.target.value,
                })
              }
              required
            />
            <div className="modal-buttons">
              <button onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button onClick={handleClaimItem}>Claim</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LostItems;
