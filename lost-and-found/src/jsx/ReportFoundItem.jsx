import React, { useState } from 'react';


function ReportFoundItem() {
    // State to manage the step of the form
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
  
    // Function to move to the next step
    const nextStep = () => {
      setStep(step + 1);
    };
  
    // Function to move to the previous step
    const prevStep = () => {
      setStep(step - 1);
    };
  

    
    return (
      <div className="report-found-item-container">
        {step === 1 && (
          <div className="step1">
            <h2>REPORT A FOUND ITEM</h2>
            <p> Terms and Conditions</p>
            <p>We appreciate your willingness to turn in the items you've found. By providing your information, you agree to these terms...</p>
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              I understand and agree.
            </label>
            <button disabled={!termsAccepted} onClick={nextStep}>Next</button> {/**disabled={!termsAccepted}: The button is disabled (cannot be clicked) unless termsAccepted is true.  */}
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
                  onChange={(e) => setCategory(e.target.value)}
                />
                Personal Belonging (Wallet, Bag, etc.)
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Electronics"
                  onChange={(e) => setCategory(e.target.value)}
                />
                Electronics (Phones, Laptop, etc.)
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Documents"
                  onChange={(e) => setCategory(e.target.value)}
                />
                Documents (ID, Cards, etc.)
              </label>
              <label>
                <input
                  type="radio"
                  name="category"
                  value="Other"
                  onChange={(e) => setCategory(e.target.value)}
                />
                Other (Specify)
                <input type="text" placeholder="Other category" />
              </label>
            </form>
            <button onClick={prevStep}>Previous</button>
            <button onClick={nextStep} disabled={!category}>Next</button>
          </div>
        )}


  
        {/* Add more steps here as per your requirements */}
  
        {step === 3 && (
  <div className="step3">
    <h2>REPORT A FOUND ITEM</h2>
    <h3>Response Form</h3>
    <div className="form-container">
      
      <label htmlFor="ContactNumInp">Contact Number:</label>    
      <input 
        type="text" 
        id="ContactNumInp" 
        required 
      />
      
      <label htmlFor="BrandInp">Brand:</label>  
      <input 
        type="text" 
        id="BrandInp" 
        required 
      />
      
      <label htmlFor="ColorInp">Color:</label>    
      <input 
        type="text" 
        id="ColorInp"  
        required 
      />
      
      <label htmlFor="DateFoundInp">Date Found:</label>  
      <input 
        type="date" 
        id="DateFoundInp" 
        required 
      />
      
      <label htmlFor="LocationFoundInp">Location Found:</label>    
      <input 
        type="text" 
        id="LocationFoundInp" 
        required 
      />
      
      <label htmlFor="imageUpload">Upload Image:</label>
      <input 
        type="file" 
        id="imageUpload" 
        className="btn" 
        accept="image/*" 
        required
      />
    </div>
    
    <button onClick={prevStep}>Previous</button>
    <button onClick={nextStep}>Next</button>
  </div>
)}

    {step === 4 && (
          <div className="step4">
            <h2>REPORT A FOUND ITEM</h2>
            <p> PLEASE PROCEED TO THE DISCIPLINARY OFFICE TO 
             SURRENDER FOUND ITEMS.   
            </p>
            <p>Show the Code</p>
            <h1> * * *  * </h1>

            {/* You can add more form fields here */}
            <button onClick={prevStep}>Previous</button>
            <button onClick={nextStep}>Next</button>
          </div>
        )}   

{step === 5 && (
          <div className="step5">
            <h2>REPORT A FOUND ITEM</h2>            
            <h3>Thank You!  
            </h3>
            <p>Your honesty and effort will greatly assist the owner
            in retrieving their belongings. We appreciate your
            kindness and support!</p>
 

            {/* You can add more form fields here */}
            <button onClick={prevStep}>Previous</button>
            <button onClick={nextStep}>Next</button>
          </div>
        )}   

      </div>
    );

    



  }
  
  export default ReportFoundItem;