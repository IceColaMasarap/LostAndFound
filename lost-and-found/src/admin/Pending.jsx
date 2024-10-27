import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase";
import { collectionGroup, onSnapshot } from "firebase/firestore";

function Pending() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false); // Separate state for the notification modal
  const [remark, setArchiveRemark] = useState("");
  const [claimerDetails, setClaimerDetails] = useState({
    claimedBy: "",
    claimContactNumber: "",
    claimEmail: "",
  });
  useEffect(() => {
    const foundItemsQuery = collectionGroup(db, "itemReports");

    const unsubscribe = onSnapshot(foundItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const userName = data.userDetails?.name || "N/A";

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
  const openRemoveModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowRemoveModal(true);
  };
  const openNotifModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowNotifModal(true); // Open notification modal
  };
  const handleSendNotification = () => {
    console.log(`Notification sent for item ${currentItemId}`);
    // Code to send notification (e.g., via email API)
    setShowNotifModal(false); // Close the modal after sending
  };
  const openClaimModal = (itemId) => {
    setCurrentItemId(itemId);
    setShowClaimModal(true);
  };
  const filteredItems = foundItems.filter((item) => {
    const isPending = item.status === "pending";

    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(
            item.category
          )
        : categoryFilter
        ? item.category === categoryFilter
        : true;

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.dateLost);
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    // Ensure only pending items are included
    return isPending && matchesCategory && matchesColor && matchesDateRange;
  });
  const handleArchiveItem = async (itemId) => {
    if (!itemId || !remark.trim()) return;

    const itemRef = db.collection("itemReports").doc(itemId);

    try {
      await itemRef.update({
        status: "archived",
        archiveRemark: remark, // Save the remark here
      });
      setRemark(""); // Clear the remark input after archiving
    } catch (error) {
      console.error("Error archiving item: ", error);
    }
  };

  // Sort the filtered items by dateLost and then by timeLost in descending order
  const sortedFilteredItems = filteredItems.sort((a, b) => {
    const dateComparison = b.dateLost.localeCompare(a.dateLost);

    if (dateComparison === 0) {
      return b.timeLost.localeCompare(a.timeLost);
    }

    return dateComparison;
  });

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
        <label className="adminh2">{filteredItems.length} </label>
      </div>

      <div className="containerlostdata">
        {sortedFilteredItems.map((item) => (
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
                  <button
                    className="lostitemimg2"
                    id="notifyuser"
                    onClick={() => openNotifModal(item.id)}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="removelostitem"
                    onClick={() => openRemoveModal(item.id)} // Open the remove modal with the item ID
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="checklostitem"
                    onClick={() => openClaimModal(item.id)} // Open the claim modal with the item ID
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
                  <label className="lostitemlabel3">{item.name}</label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">{item.contactNumber}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.email}</label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Lost</label>
                  <label className="lostitemlabel3">
                    {item.dateLost} at {item.timeLost}
                  </label>
                  <label className="lostitemlabel2">Location Lost</label>
                  <label className="lostitemlabel3">{item.locationLost}</label>
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

      {showNotifModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Send Notification</h2>
            <p>
              Do you want to notify the user to claim the lost item in the
              office?
            </p>

            <div className="modal-buttons">
              <button onClick={() => setShowNotifModal(false)}>Cancel</button>
              <button onClick={handleSendNotification}>
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Pending;
