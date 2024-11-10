import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/ReportFoundItem.css";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

function ReportFoundItem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [userData, setUserData] = useState({});
  const [docId, setDocId] = useState("");
  const [codeExpired, setCodeExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [confirmed, setConfirmed] = useState(false);
  const [objectName, setObjectName] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [dateFound, setDateFound] = useState("");
  const [timeFound, setTimeFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const [otherColor, setOtherColor] = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
      setUserData({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        contactNumber: user.contact,
        id: user.id,
      });
    } else {
      console.error("No user data found in sessionStorage.");
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
        const { data, error } = await supabase.storage
          .from("lost-items")
          .upload(`lost-items/${uniqueFileName}`, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error uploading image:", error);
          return null;
        }

        const baseUrl =
          "https://mxqzohhojkveomcyfxuv.supabase.co/storage/v1/object/public/lost-items/";
        const imageUrl = `${baseUrl}${data.path}`;
        setImageUrl(imageUrl);
        return imageUrl;
      } catch (err) {
        console.error("Unexpected error during image upload:", err.message);
        return null;
      }
    }
    return null;
  };

  const generateCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCodeExpired(false);
    setTimeLeft(30);
    setConfirmed(false);

    try {
      const today = new Date().toLocaleDateString("en-CA"); // Using Canadian format 'YYYY-MM-DD' for local time
      const now = new Date();
      const newDate = now.toISOString();
      const validDateFound = dateFound || newDate.split("T")[0];
      const validTimeFound = timeFound || "00:00:00";
      const holderId = userData.id;

      const uploadedImageUrl = await uploadImage();
      if (!uploadedImageUrl) {
        console.error("Image upload failed. Code generation aborted.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3001/api/report-found-item",
        {
          code: parseInt(code, 10),
          confirmed: false,
          holderid: holderId,
          category,
          brand,
          color,
          datefound: validDateFound,
          timefound: validTimeFound,
          locationfound: locationFound,
          objectname: objectName,
          imageurl: uploadedImageUrl,
          type: "Found",
          status: "pending",
        }
      );

      const data = response.data;
      if (!data || !data.id) {
        console.error("No valid data returned from the backend.");
        return;
      }

      setDocId(data.id);

      // Log that checkConfirmation and startCountdown are about to run
      console.log("Calling checkConfirmation with docId:", data.id);
      checkConfirmation(data.id);

      console.log("Calling startCountdown with docId:", data.id);
      startCountdown(data.id);
    } catch (err) {
      console.error("Unexpected error:", err.message);
    }
  };

  const checkConfirmation = (docId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/code-confirmation/${docId}`
        );
        const itemData = response.data;

        // Log the document ID and the confirmation status
        console.log(`Checking code for docId: ${docId}`);
        console.log(`Confirmation status: ${itemData.confirmed}`);

        if (itemData && itemData.confirmed) {
          console.log("Item confirmed! Setting confirmed to true.");
          setConfirmed(true);
          setCodeExpired(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error checking confirmation:", err.message);
      }
    }, 2000); // Check every 2 seconds
  };

  const expireCode = async (docId) => {
    try {
      // Using fetch instead of axios
      const response = await fetch(
        `http://localhost:3001/api/code-expiration/${docId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // If the response status is not OK, throw an error
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to expire code");
      }

      // Handle successful deletion
      console.log("Code successfully expired.");
      setCodeExpired(true);
    } catch (error) {
      console.error("Error expiring code:", error.message);
    }
  };

  const startCountdown = (docId) => {
    let timer = 30;
    setTimeLeft(timer);

    const countdownInterval = setInterval(() => {
      timer -= 1;
      setTimeLeft(timer);

      if (timer <= 0) {
        clearInterval(countdownInterval);

        if (!confirmed) {
          console.log("Timer expired, expiring the code now."); // Log for debugging
          // Use the new expireCode function
          expireCode(docId);
        }
      }
    }, 1000); // Countdown interval: 1 second
  };

  useEffect(() => {
    if (step === 4 && !generatedCode) {
      generateCode();
    }
  }, [step, generatedCode]);

  const nextStep = () => {
    if (step === 4 && !confirmed) {
      alert(
        "Your code is not yet confirmed by the admin. Please wait for confirmation."
      );
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <>
      <div className="report-found-item-container">
        {step === 1 && (
          <div className="step1">
            <h2>REPORT A FOUND ITEM</h2>
            <div className="ProgressIndi">
              <div className="step active">1</div>
              <div className="step">2</div>
              <div className="step">3</div>
              <div className="step">4</div>
              <div className="step">5</div>
            </div>

            <div className="ReportFoundContainer">
              <h3>TERMS AND CONDITIONS</h3>
              <p>
                We appreciate your willingness to turn in the items <br />{" "}
                you've found. By providing your information, you agree <br /> to
                these terms.
              </p>
              <p>
                Your personal information will be kept confidential. It <br />{" "}
                will only be used to help identify the item and will not <br />{" "}
                be shared with anyone else without your permission.
              </p>
              <p>
                Please note that NU Lost and Found DasmariÃ±as is not <br />{" "}
                responsible for any damage to items you surrender. We <br />{" "}
                sincerely appreciate your honesty in returning found <br />{" "}
                items.
              </p>
              <p>
                By surrendering a found item, you confirm that you have <br />{" "}
                read and understood these terms.
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
                  navigate("/homepage"); // Navigates to the specified route
                  setTimeout(() => {
                    // Scroll to slightly above the bottom of the page
                    const scrollOffset = 1800; // Adjust this value to change the scroll distance
                    window.scrollTo(
                      0,
                      document.body.scrollHeight - scrollOffset
                    );
                  }, 100); // Delay in milliseconds before the scroll action is executed
                }}
              >
                Home
              </button>
              <button
                className="NextBtn"
                disabled={!termsAccepted}
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step2">
            <h2>REPORT A FOUND ITEM</h2>

            <div className="ProgressIndi">
              <div className="step active">1</div>
              <div className="step active">2</div>
              <div className="step">3</div>
              <div className="step">4</div>
              <div className="step">5</div>
            </div>

            <div className="ReportLostContainer">
              <h3>CHOOSE CATEGORY</h3>
              <form>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="Personal Belonging"
                    checked={category === "Personal Belonging"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Personal Belonging
                  <ul>
                    <li>⦁ Wallet</li>
                    <li>⦁ Bag</li>
                    <li>⦁ Clothing</li>
                    <li>⦁ Jewelry, etc...</li>
                  </ul>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="Electronics"
                    checked={category === "Electronics"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Electronics
                  <ul>
                    <li>⦁ Phones</li>
                    <li>⦁ Laptop</li>
                    <li>⦁ Charger</li>
                    <li>⦁ Camera, etc...</li>
                  </ul>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="Documents"
                    checked={category === "Documents"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Documents
                  <ul>
                    <li>⦁ ID</li>
                    <li>⦁ Cards</li>
                    <li>⦁ Printed Materials</li>
                    <li>⦁ School works, etc...</li>
                  </ul>
                </label>
                <label>
                  <input
                    type="radio"
                    name="category"
                    value="Other"
                    checked={category === "Other"}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  Other (Specify)
                  {category === "Other" && (
                    <input
                      type="text"
                      className="FInput"
                      placeholder="Other category"
                      value={otherCategory}
                      onChange={(e) => setOtherCategory(e.target.value)}
                      required // Ensure this field is mandatory when "Other" is selected
                    />
                  )}
                </label>
              </form>
            </div>
            <div className="ButtonContainer">
              <button className="PrevBtn" onClick={prevStep}>
                Previous
              </button>
              <button
                className="NextBtn"
                onClick={nextStep}
                disabled={!category || (category === "Other" && !otherCategory)} // Disable button if "Other" is selected and no input is provided
              >
                Next{" "}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step3">
            <h2>REPORT A FOUND ITEM</h2>

            <div className="ProgressIndi">
              <div className="step active">1</div>
              <div className="step active">2</div>
              <div className="step active">3</div>
              <div className="step">4</div>
              <div className="step">5</div>
            </div>

            <div className="ReportFoundContainer">
              <h3>RESPONSE FORM</h3>
              <div className="FormRow">
                <label htmlFor="NameInp">Name:</label>
                <input
                  className="FInput"
                  type="text"
                  id="NameInp"
                  value={userData?.name}
                  readOnly
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="EmailInp">Email:</label>
                <input
                  className="FInput"
                  type="text"
                  id="EmailInp"
                  value={userData?.email}
                  readOnly
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="ContactNumInp">Contact Number:</label>
                <input
                  className="FInput"
                  type="text"
                  id="ContactNumInp"
                  value={userData?.contactNumber}
                  readOnly
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="ObjectNameInp">Object name:</label>
                <input
                  className="FInput"
                  type="text"
                  id="ObjectNameInp"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="BrandInp">Brand:</label>
                <input
                  className="FInput"
                  type="text"
                  id="BrandInp"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="ColorInp">Color:</label>
                <select
                  id="ColorInp"
                  className="FInput"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
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

                {color === "Others" && (
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
                <label htmlFor="DateFoundInp">Date Found:</label>
                <input
                  className="FInput"
                  type="date"
                  id="DateFoundInp"
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  required
                  max={today} // Set the max attribute to today's date
                />
              </div>

              <div className="FormRow">
                <label htmlFor="TimeFoundInp">Time Found:</label>{" "}
                {/* Added Time Found */}
                <input
                  className="FInput"
                  type="time"
                  id="TimeFoundInp"
                  value={timeFound}
                  onChange={(e) => setTimeFound(e.target.value)} // Update timeFound value
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="LocationFoundInp">Location Found:</label>
                <input
                  className="FInput"
                  type="text"
                  id="LocationFoundInp"
                  value={locationFound}
                  onChange={(e) => setLocationFound(e.target.value)}
                  required
                />
              </div>

              <div className="FormRow">
                <label htmlFor="ImageInp">Upload Image:</label>
                <input
                  className="FInput"
                  type="file"
                  id="ImageInp"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              <div className="FormRow"></div>
              {uploading && <p>Uploading image...</p>}
            </div>

            <div className="ButtonContainer">
              <button className="PrevBtn" onClick={prevStep}>
                Previous
              </button>
              <button
                className="NextBtn"
                onClick={nextStep}
                disabled={
                  !objectName ||
                  !color ||
                  !dateFound ||
                  !locationFound ||
                  !timeFound
                }
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step4">
            <h2>REPORT A FOUND ITEM</h2>

            <div className="ProgressIndi">
              <div className="step active">1</div>
              <div className="step active">2</div>
              <div className="step active">3</div>
              <div className="step active">4</div>
              <div className="step">5</div>
            </div>

            <div className="FReportFoundContainer">
              <p>
                PLEASE PROCEED TO THE DISCIPLINARY OFFICE TO SURRENDER FOUND
                ITEMS.
              </p>
              <p>Show the Code</p>
              <div>
                {codeExpired ? (
                  <div>
                    <p>Code expired. Please generate a new code.</p>
                    <button onClick={generateCode}>Generate New Code</button>
                  </div>
                ) : confirmed ? (
                  <div>
                    <p>Code confirmed</p>
                  </div>
                ) : (
                  <div>
                    <p>Time left before code expires: {timeLeft} seconds</p>
                    <h1>{generatedCode}</h1>
                    <p>Admin needs to confirm this code.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="ButtonContainer">
              <button
                className="PrevBtn"
                onClick={prevStep}
                disabled={confirmed}
              >
                Previous
              </button>
              <button
                className="Nextbtn"
                onClick={nextStep}
                disabled={!confirmed}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step5">
            <h2>REPORT A FOUND ITEM</h2>

            <div className="ProgressIndi">
              <div className="step active">1</div>
              <div className="step active">2</div>
              <div className="step active">3</div>
              <div className="step active">4</div>
              <div className="step active">5</div>
            </div>

            <div className="FReportFoundContainer">
              <h3>Thank You!</h3>
              <p>
                Your honesty and effort will greatly assist the owner in
                retrieving their belongings.
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
    </>
  );
}

export default ReportFoundItem;
