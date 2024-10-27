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
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";

function Pending() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [currentHolderId, setCurrentHolderId] = useState(null);
  const [notificationText, setNotificationText] = useState(
    "Your lost item might have been matched."
  );
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
  const openRemoveModal = (itemId, userId) => {
    setCurrentItemId(itemId);
    setCurrentHolderId(userId); // This should be set here
    setShowRemoveModal(true);
  };
  const openNotifModal = (itemId, holderId) => {
    setCurrentItemId(itemId);
    setCurrentHolderId(holderId);
    setShowNotifModal(true); // Open notification modal
  };

  const handleSendNotification = async () => {
    try {
      // Corrected path: Removed the extra comma in the path
      const itemRef = doc(
        db,
        "users",
        currentHolderId,
        "itemReports",
        currentItemId
      );
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const itemData = itemSnap.data();
        const holderId = itemData.holderId; // Assuming 'holderId' holds the item holder's ID
        const imageUrl = itemData.imageUrl; // Assuming 'holderId' holds the item holder's ID

        if (!holderId) {
          console.error("No holder ID found for this item:", currentItemId);
          return; // Stop if no holder ID is available
        }

        // Update the item report to mark the user as notified
        await updateDoc(itemRef, { notified: true });
        console.log(
          `Notification sent for item ${currentItemId} to holder ${holderId}`
        );

        // Check if notificationText is defined
        if (!notificationText) {
          console.error("Notification text is not defined.");
          return; // Stop if no notification text is available
        }

        // Create a new notification document targeting the item holder
        const notificationRef = await addDoc(
          collection(db, "users", holderId, "notifications"),
          {
            userId: holderId, // Notification directed to item holder
            itemId: currentItemId,
            objectName: itemData.objectName || "Unknown Item",
            message: notificationText,
            imageUrl: imageUrl,
            timestamp: new Date(),
          }
        );

        console.log(`Notification added with ID: ${notificationRef.id}`); // Log the ID of the new notification
        setShowNotifModal(false);
      } else {
        console.error("No document found with this ID:", currentItemId);
      }
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  };
  const handleClaimItem = async () => {
    if (!currentItemId || !claimerDetails.claimedBy.trim()) return;

    const itemRef = doc(
      db,
      "users",
      currentUserId,
      "itemReports",
      currentItemId
    ); // Use the currentUserId here

    try {
      // Check if the document exists
      const docSnap = await getDoc(itemRef);
      if (!docSnap.exists()) {
        console.error("No such document!");
        return; // or set some error state to display to the user
      }

      // Update the document
      await updateDoc(itemRef, {
        claimedBy: claimerDetails.claimedBy,
        claimContactNumber: claimerDetails.claimContactNumber,
        claimEmail: claimerDetails.claimEmail,
        dateClaimed: new Date().toISOString(),
        confirmed: true,
        status: "claimed",
      });

      // Reset state
      setShowClaimModal(false);
      setCurrentItemId(null);
      setCurrentUserId(null); // Reset after claim
      setClaimerDetails({
        claimedBy: "",
        claimContactNumber: "",
        claimEmail: "",
      });
    } catch (error) {
      console.error("Error claiming item:", error);
    }
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
  const handleArchiveItem = async (itemId, userId) => {
    if (!itemId || !userId || !remark.trim()) return; // Check if userId is also valid

    // Update the path to point to the correct Firestore document
    const itemRef = doc(db, "users", userId, "itemReports", itemId);

    try {
      await updateDoc(itemRef, {
        status: "archived",
        archiveRemark: remark, // Save the remark here
      });
      setArchiveRemark(""); // Clear the remark input after archiving
      console.log(`Item ${itemId} archived for user ${userId}.`); // Optional: Log successful archiving
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
                    onClick={() => openNotifModal(item.id, item.holderId)}
                  >
                    <FontAwesomeIcon icon={faBell} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="removelostitem"
                    onClick={() => openRemoveModal(item.id, item.holderId)}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>

                  <button
                    className="lostitemimg2"
                    id="checklostitem"
                    onClick={() => {
                      openClaimModal(item.id); // Open the claim modal with the item ID
                      setCurrentUserId(item.holderId); // Set current user ID for claiming
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
              <button onClick={() => setShowRemoveModal(false)}>No</button>
              <button
                onClick={() => {
                  handleArchiveItem(currentItemId, currentHolderId);
                  setShowRemoveModal(false); // Close modal after archiving
                }}
                disabled={!remark.trim()} // Disable if remark is empty
              >
                Yes
              </button>
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
                onClick={handleClaimItem} // Call the function to handle claiming the item
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
            <p>Customize the notification message:</p>
            <input
              type="text"
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
            />
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
