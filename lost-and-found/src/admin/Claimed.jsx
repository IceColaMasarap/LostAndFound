import React from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck } from "@fortawesome/free-solid-svg-icons";

function Claimed() {
  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Claimed Items</p>
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
              <div className="lostitempanel5">
                <label className="lostitemlabel2">Category</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Brand</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Color</label>
                <label className="lostitemlabel3">Text</label>
              </div>
              <div className="lostitempanel5">
                <label className="lostitemlabel2">Category</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Brand</label>
                <label className="lostitemlabel3">Text</label>
                <label className="lostitemlabel2">Color</label>
                <label className="lostitemlabel3">Text</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Claimed;
