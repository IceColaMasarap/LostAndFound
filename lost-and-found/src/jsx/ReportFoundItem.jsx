import React, { useState, useEffect } from "react";
import { db, storage } from "../config/firebase"; // Import Firebase instance
import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase storage methods
import { useAuth } from "../hooks/useAuth"; // Import useAuth hook to access authenticated user
import { useNavigate } from "react-router-dom";
import "../styling/ReportFoundItem.css";

function ReportFoundItem() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [code, setCode] = useState("");
  const [otherCategory, setOtherCategory] = useState("");

  const [timeFound, setTimeFound] = useState("");
  const [brand, setBrand] = useState("");
  const [objectName, setObjectName] = useState("");
  const [color, setColor] = useState("");
  const [otherColor, setOtherColor] = React.useState("");

  const [dateFound, setDateFound] = useState("");
  const [locationFound, setLocationFound] = useState("");
  const [image, setImage] = useState(null); // Store image locally
  const [imageUrl, setImageUrl] = useState(""); // To store the download URL
  const [uploading, setUploading] = useState(false); // To track upload status
  const [confirmed, setConfirmed] = useState(false); // To track code confirmation status
  const [docId, setDocId] = useState("");
  const [generatedCode, setGeneratedCode] = useState(""); // Store the generated code for display
  const { user, isLoading } = useAuth(); // Get the authenticated user's data and loading state
  const [codeExpired, setCodeExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  /**useEffect(() => {
        if (user) {
            //console.log('Authenticated user:', user);
        }
    }, [user]); **/

  // Check for loading or unauthenticated user
  if (isLoading) {
    return <div>Loading...</div>; // Add a loading state to ensure you're not trying to access the user too early
  }

  if (!user) {
    return <div>User not authenticated. Please log in.</div>;
  }

  // Function to generate a code and handle auto-deletion after 30 seconds
  const generateCode = async () => {
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    setGeneratedCode(generatedCode);
    setCodeExpired(false); // Reset expired status on new generation
    setTimeLeft(30); // Reset countdown
    setConfirmed(false); // Reset confirmation status
    const now = new Date();
    const fullDateTime = now.toLocaleString(); // e.g., "10/17/2024, 10:51 PM"

    const initialData = {
      code: generatedCode,
      confirmed: false,
      createdAt: fullDateTime, // Current date and time in ISO format
    };

    try {
      const docRef = await addDoc(
        collection(db, "users", user.id, "itemReports"),
        initialData
      );
      setDocId(docRef.id);

      // Start countdown and check confirmation every second
      const interval = setInterval(async () => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval); // Stop interval once timer hits 0
            // If the code is not confirmed when the timer hits 0, expire it
            expireCode(docRef.id);
          }
          return prevTime - 1;
        });

        // Continuously check if the code is confirmed
        const snapshot = await getDoc(
          doc(db, "users", user.id, "itemReports", docRef.id)
        );
        if (snapshot.exists() && snapshot.data().confirmed) {
          clearInterval(interval); // Stop countdown if code is confirmed
          setConfirmed(true); // Code confirmed
          setCodeExpired(false); // Code should not expire
        }
      }, 1000); // Check every second
    } catch (error) {
      console.error("Error generating or deleting code:", error);
    }
  };

  // Function to expire the code
  const expireCode = async (docId) => {
    try {
      const snapshot = await getDoc(
        doc(db, "users", user.id, "itemReports", docId)
      );
      if (snapshot.exists() && !snapshot.data().confirmed) {
        await deleteDoc(doc(db, "users", user.id, "itemReports", docId));
        setCodeExpired(true); // Mark code as expired
      }
    } catch (error) {
      console.error("Error expiring code:", error);
    }
  };

  // Generate code once the user reaches step 3
  useEffect(() => {
    if (step === 4 && !code) {
      generateCode();
    }
  }, [step, code]);

  // Real-time confirmation status listener
  useEffect(() => {
    if (step === 4 && docId) {
      console.log(
        "Listening to Firestore path:",
        `users/${user.id}/itemReports/${docId}`
      );

      // Listen for real-time updates on the 'FoundItems' document with the Firestore-generated document ID
      const docRef = doc(db, "users", user.id, "itemReports", docId); // Use the Firestore-generated document ID
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          console.log("Received data:", data);
          if (data && data.confirmed && !confirmed) {
            setConfirmed(true);
            submitFullForm(); // Automatically submit form when confirmed
            console.log(
              "Form data automatically sent after admin confirmation"
            );
          }
        } else {
          console.log("Document does not exist.");
        }
      });

      return () => unsubscribe(); // Cleanup listener
    }
  }, [step, docId, confirmed]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `itemReports/${code}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading image:", error);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          setUploading(false);
          console.log("Image available at:", downloadURL);
        });
      }
    );
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    handleImageUpload(file);
  };

  // Submit the full form to Firestore after confirmation
  const submitFullForm = async () => {
    const formData = {
      category: category === "Other" ? otherCategory : category,
      contactNumber: user?.contact,
      name: user?.name,
      email: user?.email,
      objectName,
      brand,
      color,
      dateFound,
      timeFound,
      locationFound,
      imageUrl, // Store the download URL of the image
      confirmed: true,
      status: "lost",
      type: "Found",
    };

    try {
      // Use the Firestore-generated document ID (docId) instead of code
      const docRef = doc(db, "users", user.id, "itemReports", docId); // Correct path with Firestore document ID (docId)
      console.log("Submitting form for document ID:", docId);
      await setDoc(docRef, formData, { merge: true }); // Update the document with the full form data
      console.log(
        "Full form data submitted to Firestore under the user's itemReports subcollection."
      );
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  // Move to the next step
  const nextStep = async () => {
    if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (confirmed) {
        setStep(5); // Proceed to step 5 only if the code is confirmed
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
            We appreciate your willingness to turn in the items <br /> you've found. By
            providing your information, you agree <br /> to these terms.
          </p>
          <p>
            Your personal information will be kept confidential. It <br /> will only be
            used to help identify the item and will not <br /> be shared with anyone else
            without your permission.
          </p>
          <p>
            Please note that NU Lost and Found Dasmariñas is not <br /> responsible for
            any damage to items you surrender. We <br /> sincerely appreciate your
            honesty in returning found <br /> items.
          </p>
          <p>
            By surrendering a found item, you confirm that you have <br /> read and
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
          <button className="PrevBtn"
            onClick={() => {
              navigate("/homepage"); // Navigates to the specified route
              setTimeout(() => {
                // Scroll to slightly above the bottom of the page
                const scrollOffset = 1800; // Adjust this value to change the scroll distance
                window.scrollTo(0, document.body.scrollHeight - scrollOffset);
              }, 100); // Delay in milliseconds before the scroll action is executed
            }}
          >
            Home
          </button>
          <button className="NextBtn" disabled={!termsAccepted} onClick={nextStep}>
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
          <button className="PrevBtn" onClick={prevStep}>Previous</button>
          <button className="NextBtn"
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
          <div className='FormRow'>
          <label htmlFor="NameInp">Name:</label>
          <input className='FInput'
            type="text"
            id="NameInp"
            value={user?.name}
            readOnly
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="EmailInp">Email:</label>
          <input className='FInput'
            type="text"
            id="EmailInp"
            value={user?.email}
            readOnly
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="ContactNumInp">Contact Number:</label>
          <input className='FInput'
            type="text"
            id="ContactNumInp"
            value={user?.contact}
            readOnly
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="ObjectNameInp">Object name:</label>
          <input className='FInput'
            type="text"
            id="ObjectNameInp"
            value={objectName}
            onChange={(e) => setObjectName(e.target.value)}
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="BrandInp">Brand:</label>
          <input className='FInput'
            type="text"
            id="BrandInp"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="ColorInp">Color:</label>
          <select
            id="ColorInp"
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
            <input className='FInput'
              type="text"
              placeholder="Specify color"
              value={otherColor}
              onChange={(e) => setColor(e.target.value)}
              required
            />
          )}
          </div>

<div className='FormRow'>
          <label htmlFor="DateFoundInp">Date Found:</label>
          <input className='FInput'
            type="date"
            id="DateFoundInp"
            value={dateFound}
            onChange={(e) => setDateFound(e.target.value)}
            required
          />
          </div>

<div className='FormRow'>
          
          <label htmlFor="TimeFoundInp">Time Found:</label>{" "}
          {/* Added Time Found */}
          <input className='FInput'
            type="time"
            id="TimeFoundInp"
            value={timeFound}
            onChange={(e) => setTimeFound(e.target.value)} // Update timeFound value
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="LocationFoundInp">Location Found:</label>
          <input className='FInput'
            type="text"
            id="LocationFoundInp"
            value={locationFound}
            onChange={(e) => setLocationFound(e.target.value)}
            required
          />
          </div>

<div className='FormRow'>
          <label htmlFor="ImageInp">Upload Image (optional):</label>
          <input className='FInput'
            type="file"
            id="ImageInp"
            onChange={handleImageChange}
            accept="image/*"
          />
          </div>
          <div className='FormRow'></div>
          {uploading && <p>Uploading image...</p>}
          </div>

          <div className="ButtonContainer">
          <button className="PrevBtn" onClick={prevStep}>Previous</button>
          <button className="NextBtn"
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
            PLEASE PROCEED TO THE DISCIPLINARY OFFICE TO SURRENDER FOUND ITEMS.
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
          <button className="PrevBtn" onClick={prevStep} disabled={confirmed}>
            Previous
          </button>
          <button className="Nextbtn" onClick={nextStep} disabled={!confirmed}>
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
          <p>Your honesty and effort will greatly assist the owner in retrieving their belongings.</p>
          </div>
          <button className="FinishBtn" onClick={() => navigate("/homepage#body1")}>
            Finish
          </button>
        </div>
      )}
    </div>
  );
}

export default ReportFoundItem;
