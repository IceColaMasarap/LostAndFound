import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import these for image upload
import "../styling/App.css";

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
  });

  const [image, setImage] = useState(null); // State to store the uploaded image
  const [imageUrl, setImageUrl] = useState(""); // State to store the image URL after upload

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
        imageUrl: uploadedImageUrl, // Store the image URL
        userId: auth.currentUser.uid, // Optional: Store the user ID who reported the item
      };
      await addDoc(collection(db, "lostItems"), newItemData); // Save data in Firestore
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
    itemDetails.locationFound;

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
          <p>Terms and Conditions</p>
          <p>
            We appreciate your desire to retrieve the item you lost. By
            providing your information, you agree to these terms. Your personal
            information will be kept confidential. It will be used solely to
            verify your ownership of the item and will not be shared with anyone
            else without your permission. Please note that NU Lost and Found
            Dasmariñas cannot be held responsible for any damage to items you
            claim. By claiming a lost item, you confirm that you have read and
            understood these terms.
          </p>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            I understand and agree.
          </label>
          <button disabled={!termsAccepted} onClick={() => setStep(step + 1)}>
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step2">
          <h2>REPORT A LOST ITEM</h2>
          <h3>Step 2: Choose Category</h3>
          <form>
            <label>
              <input
                type="radio"
                name="category"
                value="Personal Belonging"
                onChange={handleCategoryChange}
              />
              Personal Belonging (Wallet, Clothing, Bag, Jewelry etc.)
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Electronics"
                onChange={handleCategoryChange}
              />
              Electronics (Phones, Charger, Laptop, Camera, etc.)
            </label>
            <label>
              <input
                type="radio"
                name="category"
                value="Documents"
                onChange={handleCategoryChange}
              />
              Documents (ID, Printed Materials, Cards, School Works, etc.)
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
                  placeholder="Other category"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                />
              )}
            </label>
          </form>
          <button onClick={() => setStep(step - 1)}>Previous</button>
          <button onClick={() => setStep(step + 1)} disabled={isNextDisabled()}>
            Next
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="step3">
          <h2>REPORT A MISSING ITEM</h2>
          <h3>Response Form</h3>
          <div className="form-container">
            {/* Prefilled Name (Non-Editable) */}
            <label>
              Name:
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                readOnly
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                readOnly
              />
            </label>

            <label>
              Contact Number:
              <input
                type="text"
                value={userData.contactNumber}
                onChange={(e) =>
                  setUserData({ ...userData, contactNumber: e.target.value })
                }
                readOnly
              />
            </label>

            {/* Editable Fields */}
            <label>Brand:</label>
            <input
              type="text"
              id="brand"
              value={itemDetails.brand}
              onChange={(e) =>
                setItemDetails({ ...itemDetails, brand: e.target.value })
              }
              placeholder="Ex. Nike, Dior, Penshoppe"
            />

            <label>Color:</label>
            <input
              type="text"
              id="color"
              value={itemDetails.color}
              onChange={(e) => setItemDetails({ ...itemDetails, color: e.target.value })}
              required
              placeholder="Ex. red, blue, black"
            />

            <label>Date Found:</label>
            <input
              type="date"
              id="dateFound"
              value={itemDetails.dateFound}
              onChange={(e) => setItemDetails({ ...itemDetails, dateFound: e.target.value })}
              required
            />

            <label>Time Found:</label>
            <input
              type="time"
              id="timeFound"
              value={itemDetails.timeFound}
              onChange={(e) => setItemDetails({ ...itemDetails, timeFound: e.target.value })}
              required
            />

            <label>Location Found:</label>
            <input
              type="text"
              id="locationFound"
              value={itemDetails.locationFound}
              onChange={(e) => setItemDetails({ ...itemDetails, locationFound: e.target.value })}
              required
              placeholder="Please include what floor"
            />

            <label>Upload Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <button onClick={() => setStep(step - 1)}>Previous</button>
          <button onClick={() => saveLostItem()} disabled={!isFormComplete}>
            Submit
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="step4">
          <h2>Item Reported</h2>
          <p>
            Your report has been submitted. We'll notify you if there's a match!
          </p>
          <button onClick={() => navigate("/homepage#body1")}>
            Return to homepage
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportLostItem;
