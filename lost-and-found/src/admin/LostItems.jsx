import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase"; // Import Firebase config
import { collectionGroup, onSnapshot } from "firebase/firestore";

function LostItems() {
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    // Listen for updates in the "lostItems" collection
    const foundItemsQuery = collectionGroup(db, "FoundItems");

    // Set up a real-time listener
    const unsubscribe = onSnapshot(foundItemsQuery, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const userName = data.userDetails?.name || "N/A"; // Access userDetails.name

        return {
          id: doc.id,
          ...data,
          userName, // Add the userName to the item object
        };
      });

      setFoundItems(items);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Found Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <button className="categorybutton">Category</button>
            <button className="categorybutton">Color</button>
            <button className="categorybutton">Date Range</button>
          </div>
        </div>
        <label className="adminh2">{foundItems.length}</label>
      </div>

      <div className="containerlostdata">
        {foundItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageUrl || placeholder}
              alt="picture"
            />
            <div className="lostitembody">
              <div className="lostitemtop">
                <label className="lostitemlabel">Description</label>
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
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel2">
                  <label className="lostitemlabel2">Date Found</label>
                  <label className="lostitemlabel3">{item.dateFound}</label>
                  <label className="lostitemlabel2">Location Found</label>
                  <label className="lostitemlabel3">{item.locationFound}</label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default LostItems;
