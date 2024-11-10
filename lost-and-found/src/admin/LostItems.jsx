import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient"; // Import Supabase client

function LostItems() {
  const [foundItems, setFoundItems] = useState([]);
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

  // Fetching found items placeholder function
  const fetchFoundItems = () => {
    // Placeholder logic for fetching items without Supabase
    setFoundItems([]);
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/item-reports2")
      .then((response) => response.json())
      .then((data) => {
        setFoundItems(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    fetchFoundItems();
  }, [categoryFilter, colorFilter, dateRange]);

  const openRemoveModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowRemoveModal(true);
  };

  const openClaimModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowClaimModal(true);
  };

  const handleArchiveItem = (itemId) => {
    if (!itemId || !remark.trim()) return;
    console.log("Item archived:", itemId);
    setShowRemoveModal(false);
  };

  const handleClaimItem = () => {
    if (
      !claimerDetails.claimedBy.trim() ||
      !claimerDetails.claimContactNumber.trim() ||
      !claimerDetails.claimEmail.trim()
    ) {
      return;
    }
    console.log("Item successfully marked as claimed.");
    setShowClaimModal(false);
    setClaimerDetails({
      claimedBy: "",
      claimContactNumber: "",
      claimEmail: "",
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
        <label className="adminh2">{foundItems.length} </label>
      </div>

      <div className="containerlostdata">
        {foundItems.map((item) => (
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
                    onClick={() => openRemoveModal(item.id)}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="checklostitem"
                    onClick={() => openClaimModal(item.id)}
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
                    {item.userinfo?.firstname && item.userinfo?.lastname
                      ? `${item.userinfo.firstname} ${item.userinfo.lastname}`
                      : "N/A"}
                  </label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">
                    {item.userinfo?.contact}
                  </label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">
                    {item.userinfo?.email}
                  </label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Found</label>
                  <label className="lostitemlabel3">
                    {item.datefound} at {item.timefound}
                  </label>
                  <label className="lostitemlabel2">Location Found</label>
                  <label className="lostitemlabel3">{item.locationfound}</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showRemoveModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Archive this item?</p>
            <input
              placeholder="Archive Reason"
              value={remark} // Bind to state
              onChange={(e) => setArchiveRemark(e.target.value)} // Update state on change
            />
            <div className="modalBtnDiv">
              <button
                onClick={() => {
                  handleArchiveItem(currentItemId);
                  setShowRemoveModal(false); // Close modal after archiving
                }}
                disabled={!remark.trim()} // Disable if remark is empty
              >
                Yes
              </button>
              <button onClick={() => setShowRemoveModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
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
              onWheel={(e) => e.target.blur()} // Prevent number scroll behavior
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
              <button
                onClick={handleClaimItem}
                disabled={
                  !claimerDetails.claimedBy.trim() ||
                  !claimerDetails.claimContactNumber.trim() ||
                  !claimerDetails.claimEmail.trim()
                }
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LostItems;
