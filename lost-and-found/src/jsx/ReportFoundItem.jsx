import React, { useState, useEffect } from 'react';
import { db, storage } from '../config/firebase'; // Import Firebase instance
import { doc, setDoc, onSnapshot, collection, addDoc } from 'firebase/firestore'; // Ensure addDoc and collection are imported
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage methods
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook to access authenticated user


function ReportFoundItem() {
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [code, setCode] = useState('');
    const [otherCategory, setOtherCategory] = useState('');

    const [timeFound, setTimeFound] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [dateFound, setDateFound] = useState('');
    const [locationFound, setLocationFound] = useState('');
    const [image, setImage] = useState(null); // Store image locally
    const [imageUrl, setImageUrl] = useState(''); // To store the download URL
    const [uploading, setUploading] = useState(false); // To track upload status
    const [confirmed, setConfirmed] = useState(false); // To track code confirmation status
    const [docId, setDocId] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");  // Store the generated code for display
    const { user, isLoading } = useAuth(); // Get the authenticated user's data and loading state



    useEffect(() => {
        if (user) {
            console.log('Authenticated user:', user);
        }
    }, [user]);

    // Check for loading or unauthenticated user
    if (isLoading) {
        return <div>Loading...</div>; // Add a loading state to ensure you're not trying to access the user too early
    }

    if (!user) {
        return <div>User not authenticated. Please log in.</div>;
    }

    // Generate the unique code and send it to Firestore with "confirmed: false"
    const generateCode = async () => {
        if (!user || !user.id) {
            console.error("User is not authenticated or UID is missing.");
            return;
        }

        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();  // Generate a random code
        setGeneratedCode(generatedCode);  // Store the generated code for display in UI
        console.log("Generated Code: ", generatedCode);

        const initialData = {
            code: generatedCode,  // Store generated code in Firestore, but not as the document ID
            confirmed: false
        };

        try {
            // Create a new document with an auto-generated unique ID in the user's FoundItems subcollection
            const docRef = await addDoc(collection(db, "users", user.id, "FoundItems"), initialData);

            // Store the Firestore-generated document ID for Firestore operations
            setDocId(docRef.id);
            console.log("Unique document ID:", docRef.id);  // Log the auto-generated document ID
            console.log("Initial code submitted to user's FoundItems subcollection with status false.");
        } catch (error) {
            console.error("Error submitting initial code:", error);
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
            console.log("Listening to Firestore path:", `users/${user.id}/FoundItems/${docId}`);
    
            // Listen for real-time updates on the 'FoundItems' document with the Firestore-generated document ID
            const docRef = doc(db, "users", user.id, "FoundItems", docId);  // Use the Firestore-generated document ID
            const unsubscribe = onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    console.log("Received data:", data);
                    if (data && data.confirmed && !confirmed) {
                        setConfirmed(true);
                        submitFullForm();  // Automatically submit form when confirmed
                        console.log("Form data automatically sent after admin confirmation");
                    }
                } else {
                    console.log("Document does not exist.");
                }
            });
    
            return () => unsubscribe();  // Cleanup listener
        }
    }, [step, docId, confirmed]);



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
        setImage(file);
        handleImageUpload(file);
    };


    // Submit the full form to Firestore after confirmation
const submitFullForm = async () => {
    const formData = {
        category: category === 'Other' ? otherCategory : category,
        contactNumber: user?.contact,
        brand,
        color,
        dateFound,
        timeFound,
        locationFound,
        imageUrl,  // Store the download URL of the image
        confirmed: true,
    };

    try {
        // Use the Firestore-generated document ID (docId) instead of code
        const docRef = doc(db, "users", user.id, "FoundItems", docId);  // Correct path with Firestore document ID (docId)
        console.log("Submitting form for document ID:", docId);
        await setDoc(docRef, formData, { merge: true });  // Update the document with the full form data
        console.log("Full form data submitted to Firestore under the user's FoundItems subcollection.");
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
                setStep(5);  // Proceed to step 5 only if the code is confirmed
            } else {
                alert("Your code is not yet confirmed by the admin. Please wait for confirmation.");
            }
        } else {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    return (
        // FROM HERE TO BOTTOM KAYO GUMAWA NG CHANGES PAG GAGAWIN NYO YUNG UI
        // FROM HERE TO BOTTOM KAYO GUMAWA NG CHANGES PAG GAGAWIN NYO YUNG UI
        // FROM HERE TO BOTTOM KAYO GUMAWA NG CHANGES PAG GAGAWIN NYO YUNG UI
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
                                    required // Ensure this field is mandatory when "Other" is selected
                                />
                            )}
                        </label>
                    </form>
                    <button onClick={prevStep}>Previous</button>
                    <button
                        onClick={nextStep}
                        disabled={!category || (category === 'Other' && !otherCategory)} // Disable button if "Other" is selected and no input is provided
                    >Next </button>
                </div>
            )}

            {step === 3 && (
                <div className="step3">
                    <h2>REPORT A FOUND ITEM</h2>
                    <h3>Response Form</h3>

                    <label htmlFor="NameInp">Name:</label>
                    <input
                        type="text"
                        id="NameInp"
                        value={user?.name}

                        readOnly
                        required
                    />

                    <label htmlFor="EmailInp">Email:</label>
                    <input
                        type="text"
                        id="EmailInp"
                        value={user?.email}

                        readOnly
                        required
                    />

                    <label htmlFor="ContactNumInp">Contact Number:</label>
                    <input
                        type="text"
                        id="ContactNumInp"
                        value={user?.contact}
                        readOnly
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
                    <label>Time Found:</label>
                    <label htmlFor="TimeFoundInp">Time Found:</label> {/* Added Time Found */}
                    <input
                        type="time"
                        id="TimeFoundInp"
                        value={timeFound}
                        onChange={(e) => setTimeFound(e.target.value)} // Update timeFound value
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
                    <button
                        onClick={nextStep}
                        disabled={!brand || !color || !dateFound || !locationFound || !timeFound}
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
                    <h1>{generatedCode}</h1> {/* Display the manually generated code here */}
                    <p>Admin needs to confirm this code.</p>
                    <button onClick={prevStep}>Previous</button>
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
