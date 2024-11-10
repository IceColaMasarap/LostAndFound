import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/ReportLostItem.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";

function ReportLostItem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contactNumber: "",
  });

  const [otherColor, setOtherColor] = useState(null);
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [itemDetails, setItemDetails] = useState({
    brand: "",
    color: "",
    dateFound: "",
    locationFound: "",
    timeFound: "",
    objectName: "",
  });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const today = new Date().toLocaleDateString("en-CA"); // Using Canadian format 'YYYY-MM-DD' for local time

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user) {
      setUserData({
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        contactnumber: user.contact,
        id: user.id,
      });
    } else {
      console.log("No user data found in sessionStorage.");
    }
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (image) {
      try {
        const uniqueFileName = `${uuidv4()}-${image.name}`;

        // Upload image to Supabase storage
        const { data, error } = await supabase.storage
          .from("lost-items") // Replace with your Supabase bucket name
          .upload(`lost-items/${uniqueFileName}`, image, {
            cacheControl: "3600", // Set caching if needed
            upsert: false, // Don't overwrite existing files
          });

        if (error) {
          console.error("Error uploading image:", error.message);
          return null;
        }

        // Construct the image URL
        const imageUrl = `https://mxqzohhojkveomcyfxuv.supabase.co/storage/v1/object/public/lost-items/${data.path}`;
        setImageUrl(imageUrl);
        return imageUrl;
      } catch (err) {
        console.error("Unexpected error during image upload:", err.message);
        return null;
      }
    }

    return null;
  };

  const saveLostItem = async () => {
    try {
      const uploadedImageUrl = await uploadImage(); // Now it's okay to use await here
      const finalImageUrl = uploadedImageUrl || null;

      // Call your API to save the report and item details
      const response = await axios.post(
        "http://localhost:3001/api/report-lost-item",
        {
          category: category === "Other" ? otherCategory : category,
          brand: itemDetails.brand,
          color: itemDetails.color,
          objectName: itemDetails.objectName,
          datelost: itemDetails.dateFound,
          timelost: itemDetails.timeFound,
          locationlost: itemDetails.locationFound,
          imageUrl: finalImageUrl,
          holderid: userData.id, // Assuming user ID is stored in userData
        }
      );

      if (response.status === 201) {
        console.log("Item data saved successfully!");
        setStep(step + 1);
      } else {
        console.error("Error saving item:", response.data.message);
      }
    } catch (error) {
      console.error("Error saving item:", error.message);
    }
  };

  const isFormComplete =
    itemDetails.color &&
    itemDetails.dateFound &&
    itemDetails.timeFound &&
    itemDetails.locationFound &&
    itemDetails.objectName;

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    if (e.target.value !== "Other") {
      setOtherCategory("");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setItemDetails((prevDetails) => ({
      ...prevDetails,
      [id]: value,
    }));
  };

  const isNextDisabled = () => {
    if (category === "Other") {
      return otherCategory.trim() === "";
    }
    return category === "";
  };

  return (
    <div className="report-lost-item-container">
      {step === 1 && (
        <div className="step1">
          <h2>REPORT A LOST ITEM</h2>

          <div className="ProgressIndi">
            <div className="step active">1</div>
            <div className="step">2</div>
            <div className="step">3</div>
            <div className="step">4</div>
          </div>

          <div className="ReportLostContainer">
            <h3>TERMS AND CONDITIONS</h3>
            <p>
              We appreciate your desire to retrieve the item you lost. <br />
              By providing your information, you agree to these terms.
            </p>
            <p>
              Your personal information will be kept confidential. It will be
              used solely to verify your ownership of the item <br />
              and will not be shared with anyone else without your permission.
            </p>
            <p>
              Please note that NU Lost and Found Dasmariñas cannot <br /> be
              held responsible for any damage to items you claim. We sincerely
              appreciate your understanding regarding this matter.
            </p>
            <p>
              By claiming a lost item, you confirm that you have read <br /> and
              understood these terms.
            </p>
            <div className="CheckboxContainer">
              <label>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                />
                I understand and agree.
              </label>
            </div>
          </div>
          <div className="ButtonContainer">
            <button
              className="PrevBtn"
              onClick={() => {
                navigate("/homepage");
                setTimeout(
                  () => window.scrollTo(0, document.body.scrollHeight),
                  100
                );
              }}
            >
              Home
            </button>
            <button
              className="NextBtn"
              disabled={!termsAccepted}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step2">
          <h2>REPORT A LOST ITEM</h2>

          <div className="ProgressIndi">
            <div className="step active">1</div>
            <div className="step active">2</div>
            <div className="step">3</div>
            <div className="step">4</div>
          </div>

          <div className="ReportLostContainer">
            <h3>CHOOSE CATEGORY</h3>
            <form>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Personal Belonging"
                  onChange={handleCategoryChange}
                />
                Personal Belonging
                <ul>
                  <li>• Wallet</li>
                  <li>• Bag</li>
                  <li>• Clothing</li>
                  <li>• Jewelry, etc...</li>
                </ul>
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Electronics"
                  onChange={handleCategoryChange}
                />
                Electronics
                <ul>
                  <li>• Phones</li>
                  <li>• Laptop</li>
                  <li>• Charger</li>
                  <li>• Camera, etc...</li>
                </ul>
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Documents"
                  onChange={handleCategoryChange}
                />
                Documents
                <ul>
                  <li>• ID</li>
                  <li>• Cards</li>
                  <li>• Printed Materials</li>
                  <li>• School works, etc...</li>
                </ul>
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Other"
                  onChange={handleCategoryChange}
                />
                Other (Specify)
                {category === "Other" && (
                  <input
                    type="text"
                    className="FInput"
                    placeholder="Other category"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                  />
                )}
              </label>
            </form>
          </div>
          <div className="ButtonContainer">
            <button className="PrevBtn" onClick={() => setStep(step - 1)}>
              Previous
            </button>
            <button
              className="NextBtn"
              onClick={() => setStep(step + 1)}
              disabled={isNextDisabled()}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step3">
          <h2>REPORT A MISSING ITEM</h2>

          <div className="ProgressIndi">
            <div className="step active">1</div>
            <div className="step active">2</div>
            <div className="step active">3</div>
            <div className="step">4</div>
          </div>

          <div className="ReportLostContainer">
            <h3>RESPONSE FORM</h3>
            {/* Prefilled Name (Non-Editable) */}

            <div className="FormRow">
              <label>Name: </label>
              <input
                className="FInput"
                type="text"
                value={`${userData.firstname} ${userData.lastname}`}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                readOnly
              />
            </div>

            <div className="FormRow">
              <label>Email: </label>
              <input
                className="FInput"
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                readOnly
              />
            </div>

            <div className="FormRow">
              <label>Contact Number: </label>
              <input
                className="FInput"
                type="text"
                value={userData.contactnumber}
                onChange={(e) =>
                  setUserData({ ...userData, contactnumber: e.target.value })
                }
                readOnly
              />
            </div>

            <div className="FormRow">
              <label>Item Name:</label>
              <input
                className="FInput"
                type="text"
                id="objectName"
                value={itemDetails.objectName}
                onChange={(e) =>
                  setItemDetails({ ...itemDetails, objectName: e.target.value })
                }
                required
                placeholder="Enter the name of the item"
              />
            </div>

            {/* Editable Fields */}
            <div className="FormRow">
              <label>Brand:</label>
              <input
                className="FInput"
                type="text"
                id="brand"
                value={itemDetails.brand}
                onChange={(e) =>
                  setItemDetails({ ...itemDetails, brand: e.target.value })
                }
                placeholder="Enter the brand of the item"
              />
            </div>

            <div className="FormRow">
              <label>Color:</label>
              <select
                id="ColorInp"
                value={itemDetails.color}
                onChange={(e) => {
                  const selectedColor = e.target.value;
                  setItemDetails({ ...itemDetails, color: selectedColor });
                }}
                required
              >
                <option value="">Select a color</option>
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
                <option value="Others">Other</option>
              </select>

              {itemDetails.color === "Others" && (
                <input
                  className="FInput"
                  type="text"
                  placeholder="Specify color"
                  value={otherColor}
                  onChange={(e) => setOtherColor(e.target.value)}
                  required
                />
              )}
            </div>

            <div className="FormRow">
              <label>Date Lost:</label>
              <input
                className="FInput"
                type="date"
                id="dateFound"
                value={itemDetails.dateFound}
                onChange={(e) =>
                  setItemDetails({ ...itemDetails, dateFound: e.target.value })
                }
                required
                max={today} // Set the max attribute to today's date
              />
            </div>

            <div className="FormRow">
              <label>Time Lost:</label>
              <input
                className="FInput"
                type="time"
                id="timeFound"
                value={itemDetails.timeFound}
                onChange={(e) =>
                  setItemDetails({ ...itemDetails, timeFound: e.target.value })
                }
                required
              />
            </div>

            <div className="FormRow">
              <label>Location Lost:</label>
              <input
                className="FInput"
                type="text"
                id="locationFound"
                value={itemDetails.locationFound}
                onChange={(e) =>
                  setItemDetails({
                    ...itemDetails,
                    locationFound: e.target.value,
                  })
                }
                required
                placeholder="Enter where the item was Lost"
              />
            </div>

            <div className="FormRow">
              <label>Upload Image:</label>
              <input
                className="FInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="ButtonContainer">
            <button className="PrevBtn" onClick={() => setStep(step - 1)}>
              Previous
            </button>
            <button
              className="NextBtn"
              onClick={() => saveLostItem()}
              disabled={!isFormComplete}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="step4">
          <h2>REPORT A MISSING ITEM</h2>

          <div className="ProgressIndi">
            <div className="step active">1</div>
            <div className="step active">2</div>
            <div className="step active">3</div>
            <div className="step active">4</div>
          </div>

          <div className="LReportLostContainer">
            <h3>Item Reported!</h3>
            <p>
              Your report has been submitted. We'll notify you if there's a
              match!
            </p>
          </div>

          <button
            className="FinishBtn"
            onClick={() => navigate("/homepage#body1")}
          >
            Finish
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportLostItem;
