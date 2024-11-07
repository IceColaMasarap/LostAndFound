import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import "../styling/ReportFoundItem.css";
import { supabase } from "../supabaseClient"; // Adjust the path to your Supabase client setup
import { v4 as uuidv4 } from "uuid";

function ReportFoundItem() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [userData, setUserData] = useState("");

  const [timeFound, setTimeFound] = useState("");
  const [brand, setBrand] = useState("");
  const [objectName, setObjectName] = useState("");
  const [color, setColor] = useState("");
  const [otherColor, setOtherColor] = useState("");

  const [dateFound, setDateFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [docId, setDocId] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeExpired, setCodeExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const shouldScrollToReport1 = localStorage.getItem("scrollToReport1");
    if (shouldScrollToReport1) {
      const report1Section = document.getElementById("Report1");
      if (report1Section) {
        report1Section.scrollIntoView({ behavior: "smooth" });
      }
      localStorage.removeItem("scrollToReport1"); // Remove flag after scrolling
    }
  }, []);

  // Function to generate a code and handle auto-deletion after 30 seconds
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (user) {
      setUserData({
        name: `${user.firstname} ${user.lastname}`, // Combine first and last name
        email: user.email,
        contactNumber: user.contact,
      });
    } else {
      console.log("No user data found in sessionStorage.");
    }
  }, []); // This effect runs only once when the component mounts

  const generateCode = async () => {
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    setGeneratedCode(generatedCode);
    setCodeExpired(false);
    setTimeLeft(30);
    setConfirmed(false);
    const now = new Date();
    const fullDateTime = now.toLocaleString();

    const initialData = {
      code: generatedCode,
      confirmed: false,
      createdat: fullDateTime,
      id: userData?.id, // Replace with session or user context if needed
    };

    try {
      const { data, error } = await supabase
        .from("item-reports2")
        .insert([initialData])
        .select();

      if (error) throw error;

      const docId = data[0].id;
      setDocId(docId);

      // Start countdown and check confirmation every second
      const interval = setInterval(async () => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            expireCode(docId);
          }
          return prevTime - 1;
        });

        const { data: itemData, error: getError } = await supabase
          .from("item-reports2")
          .select("confirmed")
          .eq("id", docId);

        if (getError) throw getError;

        if (itemData[0]?.confirmed) {
          clearInterval(interval);
          setConfirmed(true);
          setCodeExpired(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error generating or deleting code:", error);
    }
  };

  // Function to expire the code
  const expireCode = async (docId) => {
    try {
      const { data, error } = await supabase
        .from("item-reports2")
        .select("confirmed")
        .eq("id", docId);

      if (error) throw error;

      if (!data[0]?.confirmed) {
        const { error: deleteError } = await supabase
          .from("item-reports2")
          .delete()
          .eq("id", docId);

        if (deleteError) throw deleteError;
        setCodeExpired(true);
      }
    } catch (error) {
      console.error("Error expiring code:", error);
    }
  };

  useEffect(() => {
    if (step === 4 && !code) {
      generateCode();
    }
  }, [step, code]);

  const handleImageUpload = async (file) => {
    const uniqueFileName = `${uuidv4()}-${image.name}`;

    if (!file) return;
    setUploading(true);
    const { data, error } = await supabase.storage
      .from("lost-items")
      .upload(`lost-items/${uniqueFileName}`, file);

    if (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
      return;
    }
    const baseUrl =
      "https://mxqzohhojkveomcyfxuv.supabase.co/storage/v1/object/public/lost-items/";
    const imageUrl = `${baseUrl}${data.path}`;
    setImageUrl(imageUrl);
    setUploading(false);
    console.log("Image available at:", imageUrl);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    handleImageUpload(file);
  };

  const submitFullForm = async () => {
    const formData = {
      category: category === "Other" ? otherCategory : category,
      objectName,
      brand,
      color,
      dateFound,
      timeFound,
      locationFound,
      imageUrl,
      confirmed: true,
      status: "found",
      type: "Found",
    };

    try {
      const { error } = await supabase
        .from("item-reports2")
        .update(formData)
        .eq("id", docId);

      if (error) throw error;

      console.log("Full form data submitted to Supabase.");
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  const nextStep = async () => {
    if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (confirmed) {
        setStep(5);
      } else {
        alert(
          "Your code is not yet confirmed by the admin. Please wait for confirmation."
        );
      }
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
                Please note that NU Lost and Found Dasmariñas is not <br />{" "}
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
                  localStorage.setItem("scrollToSection", "Report1"); // Set target section
                  navigate("/homepage"); // Only navigate to /homepage
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
                    checked={category === "Electronics"}
                    onChange={(e) => setCategory(e.target.value)}
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
                    checked={category === "Documents"}
                    onChange={(e) => setCategory(e.target.value)}
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
                    onChange={(e) => setColor(e.target.value)}
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
