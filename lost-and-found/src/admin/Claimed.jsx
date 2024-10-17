import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase"; // Import Firebase config
import { collectionGroup, onSnapshot } from "firebase/firestore";

function Claimed() {
  const [claimedItems, setClaimedItems] = useState([]);

  // Fetch claimed items from Firebase
  useEffect(() => {
    const claimedItemsQuery = collectionGroup(db, "ClaimedItems");

    const unsubscribe = onSnapshot(claimedItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClaimedItems(items);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Claimed Items</p>
        </div>
        <label className="adminh2">{claimedItems.length}</label>
      </div>

      <div className="containerlostdata">
        {claimedItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageUrl || placeholder}
              alt="Claimed Item"
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
                <div className="lostitempanel5">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel5">
                  <label className="lostitemlabel2">Claimed By</label>
                  <label className="lostitemlabel3">{item.Name}</label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">{item.contactNumber}</label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.Email}</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Claimed;
