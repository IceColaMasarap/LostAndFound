import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase";
import {
  collectionGroup,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getDoc } from "firebase/firestore";

function LostItems() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [remark, setArchiveRemark] = useState("");

  const [currentItemId, setCurrentItemId] = useState(null);
  const [claimerDetails, setClaimerDetails] = useState({
    claimedBy: "",
    claimContactNumber: "",
    claimEmail: "",
  });

  useEffect(() => {
    const foundItemsQuery = collectionGroup(db, "itemReports");

    const unsubscribe = onSnapshot(foundItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const userName = data.userDetails?.name || "N/A";
          const userId = doc.ref.parent.parent.id; // Get userId from the document path

          return {
            id: doc.id,
            userId, // Add userId to the item data
            ...data,
            userName,
          };
        })
        .sort((a, b) => new Date(b.dateFound) - new Date(a.dateFound));

      setFoundItems(items);
    });

    return () => unsubscribe();
  }, []);
  const filteredItems = foundItems.filter((item) => {
    const isLost = item.status === "lost";
    const matchesCategory =
      categoryFilter === "Others"
        ? !["Personal Belonging", "Electronics", "Documents"].includes(
            item.category
          )
        : categoryFilter
        ? item.category === categoryFilter
        : true;

    const matchesColor = colorFilter ? item.color === colorFilter : true;

    const itemDate = new Date(item.dateFound);
    const matchesDateRange =
      (!dateRange.start || itemDate >= new Date(dateRange.start)) &&
      (!dateRange.end || itemDate <= new Date(dateRange.end));

    const isConfirmed = item.confirmed === true;

    return (
      isLost &&
      matchesCategory &&
      matchesColor &&
      matchesDateRange &&
      isConfirmed
    );
  });

  const sortedFilteredItems = filteredItems.sort((a, b) => {
    const dateComparison = b.dateFound.localeCompare(a.dateFound);
    if (dateComparison === 0) {
      return b.timeFound.localeCompare(a.timeFound);
    }
    return dateComparison;
  });

  // Functions for handling item removal and claims
  const handleArchiveItem = async (itemId, userId) => {
    try {
      const itemRef = doc(db, `users/${userId}/itemReports`, itemId);

      // Check if the document exists
      const docSnap = await getDoc(itemRef);
      if (!docSnap.exists()) {
        console.error("No such document!");
        return; // Handle this case appropriately
      }

      // Update the document
      await updateDoc(itemRef, {
        status: "archived",
        remark, // Include the remark
      });

      console.log("Item archived successfully");
      // Reset remark state after archiving
      setArchiveRemark("");
    } catch (error) {
      console.error("Error archiving item:", error);
    }
  };
  const handleClaimButtonClick = (item) => {
    setShowClaimModal(true);
    setCurrentItemId(item.id);
    setCurrentUserId(item.userId); // Store the userId when opening the modal
  };
  const handleClaimItem = async () => {
    try {
      const itemRef = doc(
        db,
        `users/${currentUserId}/itemReports`,
        currentItemId
      ); // Use the currentUserId here

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
                    end: prev.end && prev.end < newStart ? newStart : prev.end,
                  }));
                }}
              />
              <label className="tolabel">–</label>

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{filteredItems.length}</label>
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
                    id="removelostitem"
                    onClick={() => {
                      setShowRemoveModal(true);
                      setCurrentItemId(item.id);
                      // Assuming `userId` is part of the item data
                      setCurrentUserId(item.userId);
                    }}
                  >
                    <FontAwesomeIcon icon={faBoxArchive} />
                  </button>
                  <button
                    className="lostitemimg2"
                    id="checklostitem"
                    onClick={() => handleClaimButtonClick(item)} // Updated to use the new function
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
                  <label className="lostitemlabel3">{item.userName}</label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">{item.contactNumber}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.email}</label>
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
                  handleArchiveItem(currentItemId, currentUserId);
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
