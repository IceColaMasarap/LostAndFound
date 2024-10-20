import "../styling/homepage2.css";
import logo from "../assets/NULAFD_LOGO.svg";
import notif from "../assets/notif.svg";
import img1 from "../assets/info-1-1.png";
import img2 from "../assets/info-2-2.png";
import Report1_Img from "../assets/Report1_Img.png";
import Report2_Img from "../assets/Report2_Img.png";
import Memo1Img from "../assets/Memo1Img.png";
import Memo2Img from "../assets/Memo2Img.png";
import Report1Img from "../assets/Report1Img.png";
import Report2Img from "../assets/Report2Img.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase"; // Import Firestore instance
import { getAuth } from "firebase/auth"; // Import Firebase Auth

function Homepage2() {
  const navigate = useNavigate();

  const GoToReportLostItem = () => {
    navigate("/report-lost-item"); // Navigate to /report-lost-item
  };

  const GoToReportFoundItem = () => {
    navigate("/report-found-item"); // Navigate to /report-lost-item
  };

  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Fetch the current logged-in user using Firebase Auth
    const fetchAuthenticatedUserUid = async () => {
      const auth = getAuth();
      const user = auth.currentUser; // Get the current authenticated user

      if (user) {
        // Set the logged-in user's UID
        setUid(user.uid);
      } else {
        console.log("No user is logged in");
      }

      setLoading(false);
    };

    fetchAuthenticatedUserUid();
  }, []);

  useEffect(() => {
    if (!loading && uid === "4skSWo0Ld2YnIZG1hGRaNQd3Kg72") {
      // If the user's uid matches the admin uid, navigate to the admin page
      navigate("/adminpage");
    }
  }, [loading, uid, navigate]);

  return (
    <div className="homepage-main">
    <div className="navbar">
      <div className="start">
        <img src={logo} alt="NU Logo" className="logo" />
        <label>NU LOST AND FOUND DASMARIÑAS</label>
      </div>
      <div className="navs">
        <nav className="nav">
          <a href="#HomePage">Home</a>
          <a href="#Memo1">Memorandum</a>
          <a href="#Report1">Report</a>
        </nav>
      </div>
      <img src={notif} alt="Notifications" className="notif" />
    </div>
  

      <div className="sections">
        <div className="HomePage" id="HomePage">

          <div className="HomePageContent">
            <h1>The lost items are in DO’s hands.</h1>
            <p>
              Welcome to our page, the easy way to manage lost and found items
              on campus. Quickly report and locate missing belongings, helping
              students reconnect with their items.
            </p>
          </div>
          <div className="ItemStatus">
            <div className="LostStatus">
              <h2>99+</h2>
              <span>Lost Items</span>
            </div>
            <div className="FoundStatus">
              <h2>98</h2>
              <span>Found Items</span>
            </div>
          </div>
        </div>

        <div className="Memo1" id="Memo1">
          <img src={Memo1Img} className="Memo1Img" />
          <div className="Memo1TextContainer">
            <h1>Memorandum for the Disposal of Found Items.</h1>
            <p>
              • Unclaimed property that easily decays, releases odor, or is perishable will be disposed of within 48 hours.
              Proper documentation, such as a picture, will be provided.<br />
              • Unclaimed non-perishable property will be disposed of after the end of the academic year.<br />
              • All items shredded or disposed of must be recorded in the Lost and Found Property Logbook.
            </p>
          </div>
        </div>

        <div className="Memo2">
          <div className="Memo2TextContainer">
            <h1>Memorandum for the Claiming of Found Items.</h1>
            <p>
              • Perishable and personal items that can emit foul odor must be claimed within 48 hours to prevent pest infestation.<br />
              • Non-perishable items can be claimed at the end of the term.<br />
              <br />
              Items that are perishable and other personal items that can emit foul odor are as follows.<br />
              • Food and Beverages (Lunch Box, Tumbler, etc.)<br />
              • Personal Care Items (Toiletries, etc.)<br />
              • Fabric (Clothes, Lab Gown, Towel, Jacket Socks, etc.)<br />
              <br />
              Items that are non-perishable are as follows.<br />
              • Accessories<br />
              • Electronics
            </p>
          </div>
          <img src={Memo2Img} className="Memo2Img" />
        </div>


        <div className="Report1" id="Report1">
          <img src={Report1Img} className="Report1Img" />
          <div className="Report1TextContainer">
            <h1>Report a Found Item.</h1>
            <p>
              When reporting a found item, please follow the necessary steps below to help us identify the item and the person who surrendered it.<br />
              <br />
              • Please read the Terms and Conditions.<br />
              • Describe the item you found.<br />
              • Fill out the Response Form.
            </p>
            <button className="ReportFoundbtn" onClick={GoToReportFoundItem} >Report a Found Item</button>
          </div>
        </div>

        <div className="Report2">
          <div className="Report2TextContainer">
            <h1>Report a Missing Item.</h1>
            <p>
              When reporting a missing item, please follow the necessary steps below to help us identify you and check for matching items based on your description.<br />
              <br />
              • Please read the Terms and Conditions.<br />
              • Describe the item you lost.<br />
              • Fill out the Response Form.
            </p>
            <button className="ReportLostbtn" onClick={GoToReportLostItem}>
              Report a Missing Item
            </button>
          </div>
          <img src={Report2Img} className="Report2Img" />
        </div>
      </div>
    </div>
  );
}

export default Homepage2;
