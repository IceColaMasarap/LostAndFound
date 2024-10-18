import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "./firebase";
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
    objectName: "",
  });
  const [otherColor, setOtherColor] = useState(null); // State to store the uploaded image

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
      const now = new Date();

      // Full Date and Time
      const fullDateTime = now.toLocaleString(); // e.g., "10/17/2024, 10:51 PM"

      const newItemData = {
        category: category === "Other" ? otherCategory : category,
        brand: itemDetails.brand,
        color: itemDetails.color,
        dateLost: itemDetails.dateLost,
        timeLost: itemDetails.timeLost,
        locationLost: itemDetails.locationLost,
        objectName: itemDetails.objectName,
        imageUrl: uploadedImageUrl, // Store the image URL

        // Save user details (name, email, contact number)
        name: userData.name,
        email: userData.email,
        contactNumber: userData.contactNumber,
        status: "pending",
        type: "Lost",

        // Add createdAt timestamp
        createdAt: fullDateTime, // Current date and time in ISO format
      };

      await addDoc(collection(userDocRef, "itemReports"), newItemData); // Save data in Firestore
      setStep(step + 1); // Move to next step
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Check if all required fields in the form are complete
  const isFormComplete =
    itemDetails.color &&
    itemDetails.dateLost &&
    itemDetails.timeLost &&
    itemDetails.locationLost &&
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
          <button
            onClick={() => {
              navigate("/homepage");
              setTimeout(
                () => window.scrollTo(0, document.body.scrollHeight),
                100
              );
            }}
          >
            Return to homepage
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
            <label>
              Name:
              <input
                type="text"
                value={userData.name || ""} // Default to empty string if undefined
                readOnly
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                value={userData.email || ""} // Default fallback
                readOnly
              />
            </label>

            <label>
              Contact Number:
              <input
                type="text"
                value={userData.contactNumber || ""} // Ensure a controlled value
                readOnly
              />
            </label>

            <label>Object Name:</label>
            <input
              type="text"
              id="objectName"
              value={itemDetails.objectName || ""} // Ensure it's always controlled
              onChange={(e) =>
                setItemDetails({ ...itemDetails, objectName: e.target.value })
              }
              required
              placeholder="Ex. Wallet, Watch, Glasses"
            />

            <label>Brand:</label>
            <input
              type="text"
              id="brand"
              value={itemDetails.brand || ""} // Fix: Add fallback to avoid undefined
              onChange={(e) =>
                setItemDetails({ ...itemDetails, brand: e.target.value })
              }
              placeholder="Ex. Nike, Dior, Penshoppe"
            />

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
                type="text"
                placeholder="Specify color"
                value={otherColor}
                onChange={(e) => setOtherColor(e.target.value)}
                required
              />
            )}

            <label>Date Lost:</label>
            <input
              type="date"
              id="dateLost"
              value={itemDetails.dateLost || ""}
              onChange={(e) =>
                setItemDetails({ ...itemDetails, dateLost: e.target.value })
              }
              required
            />

            <label>Time Lost:</label>
            <input
              type="time"
              id="timeLost"
              value={itemDetails.timeLost || ""}
              onChange={handleInputChange}
              required
            />

            <label>Location Lost:</label>
            <input
              type="text"
              id="locationLost"
              value={itemDetails.locationLost || ""}
              onChange={(e) =>
                setItemDetails({
                  ...itemDetails,
                  locationLost: e.target.value,
                })
              }
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
