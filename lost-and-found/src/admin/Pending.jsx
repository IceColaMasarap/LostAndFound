import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../jsx/firebase";

function Pending() {
  const [itemsData, setItemsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Function to fetch data from Firestore

  const fetchItemsData = async () => {
    const collectionRef = collection(
      db,
      "users",
      "aTpg8vREUYTYtl1kASj5YAN6YlB3",
      "lostItems"
    );
    const querySnapshot = await getDocs(collectionRef);

    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id, // in case you want to track the document ID
      ...doc.data(),
    }));

    setItemsData(items);
  };

  useEffect(() => {
    fetchItemsData();
  }, []);

  // Handle next item
  const handleNext = () => {
    if (currentIndex < itemsData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Handle previous item
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (itemsData.length === 0) {
    return <p>Loading...</p>;
  }

  const currentItem = itemsData[currentIndex];

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Pending Reports</p>
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
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Category:</strong> {currentItem.category}
                  </p>
                </label>
                <label className="lostitemlabel2">Brand</label>
                <label className="lostitemlabel3">
                  <p>
                    <strong>Brand:</strong> {currentItem.brand}
                  </p>
                </label>
                <label className="lostitemlabel2">Color</label>
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Color:</strong> {currentItem.color}
                  </p>
                </label>
              </div>
              <div className="lostitempanel1">
                <label className="lostitemlabel2">Reported by:</label>
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Name:</strong> {currentItem.userDetails?.name}
                  </p>
                </label>
                <label className="lostitemlabel2">Contact Number:</label>
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {currentItem.userDetails?.contactNumber}
                  </p>
                </label>
                <label className="lostitemlabel2">Email:</label>
                <label className="lostitemlabel3">
                  <p>
                    <strong>Email:</strong> {currentItem.userDetails?.email}
                  </p>
                </label>
              </div>
              <div className="lostitempanel2">
                <label className="lostitemlabel2">Date Found</label>
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Date Found:</strong> {currentItem.dateFound}
                  </p>{" "}
                  <p>
                    <strong>Time Found:</strong> {currentItem.timeFound}
                  </p>{" "}
                </label>
                <label className="lostitemlabel2">Location Found</label>
                <label className="lostitemlabel3">
                  {" "}
                  <p>
                    <strong>Location Found:</strong> {currentItem.locationFound}
                  </p>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Pending;
