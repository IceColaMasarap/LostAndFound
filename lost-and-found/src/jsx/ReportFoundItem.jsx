import React, { useState, useEffect } from 'react';
import { db, storage } from '../config/firebase'; // Import your db and Firebase Storage instance
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'; // Import doc, setDoc, getDoc from Firestore
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

        // Save the code with confirmed status as false initially
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

    useEffect(() => {
        if (step === 3 && !code) {
            generateCode(); // Generate code when the user reaches step 3
        }
    }, [step, code]);


    // Real-time confirmation status listener (Optional)
    useEffect(() => {
        if (step === 4 && code) {
            const docRef = doc(db, "FoundItems", code);
            const unsubscribe = onSnapshot(docRef, (doc) => {
                const data = doc.data();
                if (data && data.confirmed) {
                    setConfirmed(data.confirmed);
                    console.log("Code confirmed in real-time");
                }
            });

            // Cleanup listener when unmounting
            return () => unsubscribe();
        }
    }, [step, code]);

    // Upload image to Firebase Storage and get the download URL
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

    // Handle image file change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file); // Store the selected image file
        handleImageUpload(file); // Upload the image file
    };

    // Submit the full form to Firestore after step 3
    const submitFormToFirestore = async () => {
        const formData = {
            category: category === 'Other' ? otherCategory : category,
            contactNumber,
            brand,
            color,
            dateFound,
            locationFound,
            imageUrl,  // Store the download URL of the image
            name: user?.name,   // Use the name from Firestore (firstName + lastName)
            email: user?.email,  // Use the authenticated user's email
            confirmed: false // Still waiting for admin confirmation
        };

        try {
            // Update the document with the generated code and form data
            await setDoc(doc(db, "FoundItems", code), formData, { merge: true });
            console.log("Form data submitted to Firestore after step 3.");
        } catch (error) {
            console.error("Error submitting form data:", error);
        }
    };

    // Move to the next step, ensuring form data is sent after step 3
    const nextStep = async () => {
        if (step === 3) {
            await submitFormToFirestore(); // Submit form data after step 3
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
                    <label htmlFor="ImageInp">Upload Image:</label>
                    <input
                        type="file"
                        id="ImageInp"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    {uploading && <p>Uploading image...</p>}
                    <button onClick={prevStep}>Previous</button>
                    <button onClick={nextStep} disabled={uploading}>Next</button>
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
                    {/* Disable the Next button if the code is not confirmed */}
                    <button onClick={nextStep} disabled={!confirmed}>Next</button>
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
