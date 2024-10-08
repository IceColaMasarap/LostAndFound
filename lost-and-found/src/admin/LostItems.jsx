import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import { db } from "../config/firebase"; // Import Firebase config
import { collection, onSnapshot } from "firebase/firestore"; 
function LostItems() {
  const [lostItems, setLostItems] = useState([]);
  
 // Fetch lost items from Firestore
 useEffect(() => {
  const fetchItems = onSnapshot(collection(db, "FoundItems"), (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLostItems(items); // Set the lost items to state
  });

  return () => fetchItems(); // Cleanup the listener on unmount
}, []);


  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Lost Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <button className="categorybutton">Category</button>
            <button className="categorybutton">Color</button>
            <button className="categorybutton">Date Range</button>
          </div>
        </div>
        <label className="adminh2">100</label>
      </div>

      <div className="containerlostdata">
        <div className="lostitemcontainer">
          <img className="lostitemimg" src={placeholder} alt="picture" />
          <div className="lostitembody">
            <div className="lostitemtop">
              <label className="lostitemlabel">Description</label>
              <div className="buttonslost">
                <button className="lostitemimg2" id="removelostitem">
                  <FontAwesomeIcon icon={faTrash} />
                </button>{" "}
                <button className="lostitemimg2" id="checklostitem">
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
            <div className="lostitembody1">
              <div className="lostitempanel1">
                <label className="lostitemlabel2">Category</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Brand</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Color</label>
                <label className="lostitemlabel3">Text</label>
              </div>
              <div className="lostitempanel1">
                <label className="lostitemlabel2">Category</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Brand</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Color</label>
                <label className="lostitemlabel3">Text</label>
              </div>
              <div className="lostitempanel2">
                <label className="lostitemlabel2">Date Found</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Location Found</label>
                <label className="lostitemlabel3">Paragraph</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lost-items-container">
      {lostItems.length > 0 ? (
        lostItems.map((item) => (
          <div key={item.id} className="lost-item-card">
            <h3>Item Details</h3>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Name:</strong> {item.Name}</p>
            <p><strong>Brand:</strong> {item.brand}</p>
            <p><strong>Color:</strong> {item.color}</p>
            <p><strong>Date Found:</strong> {item.dateFound}</p>
            <p><strong>Time Found:</strong> {item.timeFound}</p>
            <p><strong>Location Found:</strong> {item.locationFound}</p>
            <p><strong>Email:</strong> {item.Email}</p>
            <p><strong>Contact Number:</strong> {item.contactNumber}</p>
          </div>
        ))
      ) : (
        <p>No lost items found</p>
      )}
    </div>

    </>
  );
}

export default LostItems;
