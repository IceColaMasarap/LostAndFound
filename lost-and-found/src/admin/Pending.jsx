import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import emailjs from "emailjs-com";
import axios from "axios";

function Pending() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentHolderId, setCurrentHolderId] = useState(null);
  const [userInfo, setUserInfo] = useState([]); // State for user info
  const [notificationText, setNotificationText] = useState(
    "Your lost item might have been matched."
  );
  const [showNotifModal, setShowNotifModal] = useState(false);

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



  // Filtering data based on user selections
  useEffect(() => {
    fetch("http://localhost:3001/api/item-reports")
      .then((response) => response.json())
      .then((data) => {
        let filteredItems = data;
        if (categoryFilter) {
          filteredItems = filteredItems.filter((item) => item.category === categoryFilter);
        }
        if (colorFilter) {
          filteredItems = filteredItems.filter((item) => item.color === colorFilter);
        }
        if (dateRange.start && dateRange.end) {
          filteredItems = filteredItems.filter((item) => {
            const itemDate = new Date(item.datelost);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        setFoundItems(filteredItems);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [categoryFilter, colorFilter, dateRange]);


  useEffect(() => {
    fetchFoundItems();
  }, [categoryFilter, colorFilter, dateRange]);

  const openRemoveModal = (id) => {
    console.log("Opening remove modal for item ID:", id);
    setCurrentItemId(id); // Keep using currentItemId in your state
    setShowRemoveModal(true);
  };




  const openNotifModal = (itemId, holderId) => {
    setCurrentItemId(itemId);
    setCurrentHolderId(holderId);
    setShowNotifModal(true);
  };

  const handleSendNotification = () => {
    console.log(
      `Notification sent for item ${currentItemId} to holder ${currentHolderId}`
    );
    sendEmail();
    setNotificationText("Your lost item might have been matched.");
    setShowNotifModal(false);
  };

  const sendEmail = () => {
    emailjs
      .send(
        "service_qkeo7fe",
        "template_0eal5kf",
        {
          message: notificationText,
        },
        "ukdUNXpTIsD5n9sfO"
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response);
        },
        (err) => {
          console.log("FAILED...", err);
        }
      );
  };

  const openClaimModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowClaimModal(true);
  };

  const handleArchiveItem = async (itemid) => {
    if (!itemid || !remark.trim()) {
      console.error("Item ID or remark is missing!");
      return;
    }

    console.log("Archiving item with ID:", itemid);

    try {
      // Update the status of the item in item_reports2
      await axios.put(`http://localhost:3001/api/archive-item/${itemid}`, {
        status: "archived",
      });

      // Insert data into archived_items using itemid (lowercase)
      await axios.post("http://localhost:3001/api/add-to-archived", {
        item_id: itemid, // Using itemid as required by your database schema
        archiveremark: remark,
        archivedate: new Date().toISOString(),
      });

      console.log("Item archived successfully:", itemid);
    } catch (error) {
      console.error("Error archiving item:", error.message);
    } finally {
      fetchFoundItems();
      setShowRemoveModal(false);
    }
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
          <p className="header">Missing Item Reports</p>
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
        {foundItems.map((item, index) => (
          <div key={item.id || index} className="lostitemcontainer"> {/* Ensure a unique key */}
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
                    id="notifyuser"
                    onClick={() => openNotifModal(item.id, item.holderid)}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
                  {/* Place your button for removing items here */}
                  <button
                    className="lostitemimg2"
                    id="removelostitem"
                    onClick={() => openRemoveModal(item.id)}// Update `item.id` to the correct property name, if necessary
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
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
                  <label className="lostitemlabel2">Reported by</label>
                  <label className="lostitemlabel3">
                    {item.firstName} {item.lastName}
                  </label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">{item.contact}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.email}</label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Lost</label>
                  <label className="lostitemlabel3">
                    {new Date(item.datelost).toLocaleDateString("en-US")} at{" "}
                    {item.timelost}
                  </label>
                  <label className="lostitemlabel2">Location Lost</label>
                  <label className="lostitemlabel3">{item.locationlost}</label>
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
              value={remark}
              onChange={(e) => setArchiveRemark(e.target.value)}
            />
            <div className="modalBtnDiv">
              <button
                onClick={() => {
                  console.log("Yes button clicked");
                  handleArchiveItem(currentItemId); // Ensure this uses the correct state variable
                  setShowRemoveModal(false);
                }}
                disabled={!remark.trim()}
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
            />

            <label>Email Address:</label>
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

            <div className="modalBtnDiv">
              <button
                onClick={() => {
                  handleClaimItem(currentItemId);
                }}
                disabled={
                  !claimerDetails.claimedBy.trim() ||
                  !claimerDetails.claimContactNumber.trim() ||
                  !claimerDetails.claimEmail.trim()
                }
              >
                Confirm
              </button>
              <button onClick={() => setShowClaimModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Send Notification?</p>
            <textarea
              className="notifText"
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
            />
            <div className="modalBtnDiv">
              <button onClick={handleSendNotification}>Yes</button>
              <button onClick={() => setShowNotifModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pending;