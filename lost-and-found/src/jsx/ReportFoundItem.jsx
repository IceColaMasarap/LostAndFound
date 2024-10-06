import React, { useState, useEffect } from 'react';
import { db, storage } from '../config/firebase'; // Import your db and Firebase Storage instance
import { doc, setDoc, onSnapshot } from 'firebase/firestore'; // Import Firestore methods
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage methods
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook to access authenticated user

function ReportFoundItem() {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [code, setCode] = useState('');
    const [otherCategory, setOtherCategory] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [dateFound, setDateFound] = useState('');
    const [locationFound, setLocationFound] = useState('');
    const [image, setImage] = useState(null); // Store image locally
    const [imageUrl, setImageUrl] = useState(''); // To store the download URL
    const [uploading, setUploading] = useState(false); // To track upload status
    const [confirmed, setConfirmed] = useState(false); // To track code confirmation status

    const { user } = useAuth(); // Get the authenticated user's data (email, name, etc.)

    // Generate the unique code and send it to Firestore with "confirmed: false"
    const generateCode = async () => {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCode(generatedCode);
        console.log("Generated Code: ", generatedCode);

        // Save only the code and confirmed status as false initially
        const initialData = {
            code: generatedCode,
            confirmed: false
        };
        try {
            await setDoc(doc(db, "FoundItems", generatedCode), initialData);
            console.log("Initial code submitted with status false.");
        } catch (error) {
            console.error("Error submitting initial code:", error);
        }
    };

    // Generate code once the user reaches step 3
    useEffect(() => {
        if (step === 3 && !code) {
            generateCode();
        }
    }, [step, code]);

    // Real-time confirmation status listener
    useEffect(() => {
        if (step === 4 && code) {
            const docRef = doc(db, "FoundItems", code);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                const data = doc.data();
                if (data && data.confirmed && !confirmed) {
                    // If the code is confirmed, submit the full form data
                    setConfirmed(true);
                    submitFullFormToFirestore();  // Automatically submit form when confirmed
                    console.log("Form data automatically sent after admin confirmation");
                }
            });
            return () => unsubscribe();
        }
    }, [step, code]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const storageRef = ref(storage, `foundItems/${code}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error('Error uploading image:', error);
                setUploading(false);
            },
            () => {
                // When upload is complete, get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageUrl(downloadURL);
                    setUploading(false);
                    console.log('Image available at:', downloadURL);
                });
            }
        );
    };

    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file); // Store the selected image file
        handleImageUpload(file); // Upload the image file
    };

    // Submit the full form to Firestore after confirmation
    const submitFullFormToFirestore = async () => {
        const formData = {
            category: category === 'Other' ? otherCategory : category,
            contactNumber,
            brand,
            color,
            dateFound,
            locationFound,
            imageUrl,  // Store the download URL of the image
            name: user?.name,   // Use the authenticated user's name
            email: user?.email, // Use the authenticated user's email
            confirmed: true     // The item is now confirmed
        };

        try {
            await setDoc(doc(db, "FoundItems", code), formData, { merge: true });
            console.log("Full form data submitted to Firestore after confirmation.");
        } catch (error) {
            console.error("Error submitting form data:", error);
        }
    };

    // Move to the next step
    const nextStep = async () => {
        if (step === 3) {
            // Move to step 4 and listen for confirmation
            setStep(4);
        } else if (step === 4) {
            if (confirmed) {
                setStep(5); // Proceed to step 5 only if the code is confirmed
            } else {
                alert("Your code is not yet confirmed by the admin. Please wait for confirmation.");
            }
        } else {
            setStep(step + 1); // For other steps, proceed as normal
        }
    };

    // Define prevStep to handle moving back steps
    const prevStep = () => {
        setStep(step - 1); // Move to the previous step
    };

    return (
        <div className="report-found-item-container">
            {step === 1 && (
                <div className="step1">
                    <h2>REPORT A FOUND ITEM</h2>
                    <p> Terms and Conditions</p>
                    <label>
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={() => setTermsAccepted(!termsAccepted)}
                        />
                        I understand and agree.
                    </label>
                    <button disabled={!termsAccepted} onClick={nextStep}>Next</button>
                </div>
            )}

            {step === 2 && (
                <div className="step2">
                    <h2>REPORT A FOUND ITEM</h2>
                    <h3>Step 2: Choose Category</h3>
                    <form>
                        <label>
                            <input
                                type="radio"
                                name="category"
                                value="Personal Belonging"
                                checked={category === "Personal Belonging"}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            Personal Belonging (Wallet, Bag, etc.)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="category"
                                value="Electronics"
                                checked={category === "Electronics"}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            Electronics (Phones, Laptop, etc.)
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="category"
                                value="Documents"
                                checked={category === "Documents"}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            Documents (ID, Cards, etc.)
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
                            {category === 'Other' && (
                                <input
                                    type="text"
                                    placeholder="Other category"
                                    value={otherCategory}
                                    onChange={(e) => setOtherCategory(e.target.value)}
                                />
                            )}
                        </label>
                    </form>
                    <button onClick={prevStep}>Previous</button>
                    <button onClick={nextStep} disabled={!category}>Next</button>
                </div>
            )}

            {step === 3 && (
                <div className="step3">
                    <h2>REPORT A FOUND ITEM</h2>
                    <h3>Response Form</h3>
                    <label htmlFor="ContactNumInp">Contact Number:</label>
                    <input
                        type="text"
                        id="ContactNumInp"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        required
                    />
                    <label htmlFor="BrandInp">Brand:</label>
                    <input
                        type="text"
                        id="BrandInp"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        required
                    />
                    <label htmlFor="ColorInp">Color:</label>
                    <input
                        type="text"
                        id="ColorInp"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        required
                    />
                    <label htmlFor="DateFoundInp">Date Found:</label>
                    <input
                        type="date"
                        id="DateFoundInp"
                        value={dateFound}
                        onChange={(e) => setDateFound(e.target.value)}
                        required
                    />
                    <label htmlFor="LocationFoundInp">Location Found:</label>
                    <input
                        type="text"
                        id="LocationFoundInp"
                        value={locationFound}
                        onChange={(e) => setLocationFound(e.target.value)}
                        required
                    />
                    <label htmlFor="ImageInp">Upload Image (optional):</label>
                    <input
                        type="file"
                        id="ImageInp"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    {uploading && <p>Uploading image...</p>}
                    <button onClick={prevStep}>Previous</button>
                    {/* Disable "Next" if any required field is empty */}
                    <button
                        onClick={nextStep}
                        disabled={
                            !contactNumber || !brand || !color || !dateFound || !locationFound || uploading
                        }
                    >
                        Next
                    </button>
                </div>
            )}


            {step === 4 && (
                <div className="step4">
                    <h2>REPORT A FOUND ITEM</h2>
                    <p> PLEASE PROCEED TO THE DISCIPLINARY OFFICE TO SURRENDER FOUND ITEMS. </p>
                    <p>Show the Code</p>
                    <h1>{code}</h1>
                    <p>Admin needs to confirm this code.</p>
                    <button onClick={prevStep}>Previous</button>
                    <button onClick={nextStep} disabled={!confirmed} >Next</button>
                </div>
            )}

            {step === 5 && (
                <div className="step5">
                    <h2>REPORT A FOUND ITEM</h2>
                    <h3>Thank You!</h3>
                    <p>Your honesty and effort will greatly assist the owner...</p>
                </div>
            )}
        </div>
    );
}

export default ReportFoundItem;
