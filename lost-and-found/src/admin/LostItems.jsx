import React from "react";
import "./Admin.css";
import image from "../assets/logo.png";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";
function LostItems() {
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
    </>
  );
}

export default LostItems;
