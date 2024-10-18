import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "./firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import these for image upload
import "../styling/ReportLostItem.css";

function ReportLostItem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    contactNumber: "",
  });

  // Group related fields into a single state object
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

  const [image, setImage] = useState(null); // State to store the uploaded image
  const [imageUrl, setImageUrl] = useState(""); // State to store the image URL after upload
  const user = auth.currentUser;
  const uid = user.uid;
  const userDocRef = doc(db, "users", uid);
  //Gets user info and displays them in text field at step 3
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid; // Get current user's UID
      const userDocRef = doc(db, "users", uid);

      const fetchUserData = async () => {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const firstName = docSnap.data().firstName; // Assuming Firestore has 'firstName'
          const lastName = docSnap.data().lastName; // Assuming Firestore has 'lastName'

          // Combine first name and last name into full display name
          const fullName = `${firstName} ${lastName}`;

          // Update state with combined name and other data
          setUserData({
            name: fullName,
            email: docSnap.data().email,
            contactNumber: docSnap.data().contact,
          });
        } else {
          console.log("No such document!");
        }
      };

      fetchUserData();
    } else {
      console.log("No user is signed in.");
    }
  }, []);

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Upload image to Firebase Storage and get the URL
  const uploadImage = async () => {
    if (image) {
      const imageRef = ref(storage, `lost-items/${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url); // Set image URL after upload
      return url;
    }
    return null; // Return null if no image is uploaded
  };

  // Save the lost item details to Firestore
  const saveLostItem = async () => {
    try {
      const uploadedImageUrl = await uploadImage(); // First, upload the image
      const newItemData = {
        category: category === "Other" ? otherCategory : category,
        brand: itemDetails.brand,
        color: itemDetails.color,
        dateFound: itemDetails.dateFound,
        timeFound: itemDetails.timeFound,
        locationFound: itemDetails.locationFound,
        objectName: itemDetails.objectName,
        imageUrl: uploadedImageUrl, // Store the image URL
        userDetails: {
          // Save user details (name, email, contact number)
          name: userData.name,
          email: userData.email,
          contactNumber: userData.contactNumber,
        },
      };
      await addDoc(collection(userDocRef, "lostItems"), newItemData); // Save data in Firestore
      setStep(step + 1); // Move to next step
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Check if all required fields in the form are complete
  const isFormComplete =
    itemDetails.color &&
    itemDetails.dateFound &&
    itemDetails.timeFound &&
    itemDetails.locationFound &&
    itemDetails.objectName;

  // Handle changes for category input
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    if (e.target.value !== "Other") {
      setOtherCategory("");
    }
  };

  // Update form details based on input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setItemDetails((prevDetails) => ({
      ...prevDetails,
      [id]: value,
    }));
  };

  // Determine whether to enable the "Next" button based on category selection
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
              Your personal information will be kept confidential.
              It will be used solely to verify your ownership of the item <br />
              and will not be shared with anyone else without your permission.
            </p>
            <p>
              Please note that NU Lost and Found Dasmariñas cannot <br /> be held responsible
              for any damage to items you claim. We sincerely appreciate your understanding regarding this matter.
            </p>
            <p>
              By claiming a lost item, you confirm that you have read <br /> and understood these terms.
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
            <button className="PrevBtn"
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
            <button className="NextBtn" disabled={!termsAccepted} onClick={() => setStep(step + 1)}>
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
                    className='OtherInput'
                    placeholder="Other category"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                  />
                )}
              </label>
            </form>
          </div>
          <div className="ButtonContainer">
            <button className="PrevBtn" onClick={() => setStep(step - 1)}>Previous</button>
            <button className="NextBtn" onClick={() => setStep(step + 1)} disabled={isNextDisabled()}>
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

              <div className='FormRow'>
                <label>
                  Name: </label>
                <input className='FInput'
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData({ ...userData, name: e.target.value })
                  }
                  readOnly
                />

              </div>

              <div className='FormRow'>
                <label>
                  Email: </label>
                <input className='FInput'
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  readOnly
                />

              </div>

              <div className='FormRow'>
                <label>
                  Contact Number: </label>
                <input className='FInput'
                  type="text"
                  value={userData.contactNumber}
                  onChange={(e) =>
                    setUserData({ ...userData, contactNumber: e.target.value })
                  }
                  readOnly
                />

              </div>

              <div className='FormRow'>
                <label>Item Name:</label>
                <input className='FInput'
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
              <div className='FormRow'>
                <label>Brand:</label>
                <input className='FInput'
                  type="text"
                  id="brand"
                  value={itemDetails.brand}
                  onChange={(e) =>
                    setItemDetails({ ...itemDetails, brand: e.target.value })
                  }
                  placeholder="Enter the brand of the item"
                />
              </div>

              <div className='FormRow'>
                <label>Color:</label>
                <input className='FInput'
                  type="text"
                  id="color"
                  value={itemDetails.color}
                  onChange={(e) =>
                    setItemDetails({ ...itemDetails, color: e.target.value })
                  }
                  required
                  placeholder="Enter the color of the item"
                />
              </div>

              <div className='FormRow'>
                <label>Date Lost:</label>
                <input className='FInput'
                  type="date"
                  id="dateFound"
                  value={itemDetails.dateFound}
                  onChange={(e) =>
                    setItemDetails({ ...itemDetails, dateFound: e.target.value })
                  }
                  required
                />
              </div>

              <div className='FormRow'>
                <label>Time Lost:</label>
                <input className='FInput'
                  type="time"
                  id="timeFound"
                  value={itemDetails.timeFound}
                  onChange={(e) =>
                    setItemDetails({ ...itemDetails, timeFound: e.target.value })
                  }
                  required
                />
              </div>

              <div className='FormRow'>
                <label>Location Found:</label>
                <input className='FInput'
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

              <div className='FormRow'>
                <label>Upload Image:</label>
                <input className='FInput' type="file" accept="image/*" onChange={handleImageChange} />
              </div>
          </div>

          <div className="ButtonContainer">
            <button className="PrevBtn" onClick={() => setStep(step - 1)}>Previous</button>
            <button className="NextBtn" onClick={() => saveLostItem()} disabled={!isFormComplete}>
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
            Your report has been submitted. We'll notify you if there's a match!
          </p>
          </div>

          
          <button className="FinishBtn" onClick={() => navigate("/homepage#body1")}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportLostItem;
