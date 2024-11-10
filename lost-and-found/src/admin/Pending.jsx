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

  useEffect(() => {
    fetch("http://localhost:3001/api/item-reports")
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

  const openNotifModal = (itemId, holderId) => {
    setCurrentItemId(itemId);
    setCurrentHolderId(holderId);
    setShowNotifModal(true);
  };

  const handleSendNotification = () => {
    console.log(`Notification sent for item ${currentItemId} to holder ${currentHolderId}`);
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
                    id="notifyuser"
                    onClick={() => openNotifModal(item.id, item.holderid)}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
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
                  <label className="lostitemlabel2">Reported by</label>
                  <label className="lostitemlabel3">{item.firstName} {item.lastName}</label>
                  <label className="lostitemlabel2">Contact Number </label>
                  <label className="lostitemlabel3">{item.contact}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.email}</label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Lost</label>
                  <label className="lostitemlabel3">
                     {new Date(item.datelost).toLocaleDateString("en-US")} at {item.timelost}
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
                  handleArchiveItem(currentItemId);
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
