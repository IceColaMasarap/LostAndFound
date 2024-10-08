import "../styling/homepage2.css";
import logo from "../assets/nulogo.svg";
import notif from "../assets/notif.svg";
import img1 from "../assets/info-1-1.png";
import img2 from "../assets/info-2-2.png";
import Report1_Img from "../assets/Report1_Img.png";
import Report2_Img from "../assets/Report2_Img.png";
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
            <a href="#body1">Home</a>
            <a href="#body2">Memorandum</a>
            <a href="#body3">Report</a>
          </nav>
        </div>

        <img src={notif} alt="NU Logo" className="notif" />
      </div>
      <div className="sections">
        <div id="body1" className="body1">
          <div className="paragraphs">
            <h1 id="h1">The lost items are in DO’s hands.</h1>
            <p id="h2">
              Welcome to our page, the easy way to manage lost and found items
              on campus. Quickly report and locate missing belongings, helping
              students reconnect with their items.
            </p>
          </div>
          <hr />
          <div className="infocount">
            <div className="lostitems">
              <h1 id="lostitemcount">99+</h1>
              <p>Lost Items</p>
            </div>
            <div className="founditems">
              <h1 id="founditemscount">99+</h1>
              <p>Found Items</p>
            </div>
          </div>
        </div>

        <div id="body2" className="body2">
          <img src={img1} alt="NU Logo" className="large" />
          <div className="paragraphs2">
            <h1 id="h3">Memorandum for the Disposal of Found Items.</h1>
            <ul className="h4">
              <li>
                Unclaimed property that easily decays, releases odor, or is
                perishable will be disposed of within 48 hours. Proper
                documentation, such as a picture, will be provided.
              </li>
              <li>
                Unclaimed non-perishable property will be disposed of after the
                end of the academic year.
              </li>
              <li>
                All items shredded or disposed of must be recorded in the Lost
                and Found Property Logbook.
              </li>
            </ul>
          </div>
        </div>
        <div id="body2" className="body2">
          <div className="paragraphs2" id="paragraphs2">
            <h1 id="h3">Memorandum for the Disposal of Found Items.</h1>
            <ul className="h4">
              <li>
                Perishable and personal items that can emit foul odor must be
                claimed within 48 hours to prevent pest infestation.
              </li>
              <li>
                Non-perishable items can be claimed at the end of the term.
              </li>
            </ul>
            <p className="h4">
              Items that are perishable and other personal items that can emit
              foul odor are as follows.
            </p>
            <ul className="h4">
              <li>Food and Beverages (Lunch Box, Tumbler, etc.)</li>
              <li>Personal Care Items (Toiletries, etc.)</li>
              <li>Fabric (Clothes, Lab Gown, Towel, Jacket Socks, etc.)</li>
            </ul>
            <p className="h4">Items that are non-perishable are as follows.</p>
            <ul className="h4">
              <li>Accessories</li>
              <li>Electronics</li>
            </ul>
          </div>
          <img src={img2} alt="NU Logo" className="large" id="large2" />
        </div>

        <div id="body4" className="body3">
          <img src={Report1_Img} alt="NU Logo" className="large" />
          <div className="paragraphs2">
            <h1 className="text" id="h5">
              Report an Item that you Found.
            </h1>
            <p>
              When reporting a found item, please follow the necessary steps
              below to help us identify the item and the person who surrendered
              it.
            </p>
            <ul className="h4" id="text">
              <li>Please read the Terms and Conditions.</li>
              <li>Describe the item you found.</li>
              <li>Fill out the Response Form.</li>
            </ul>
            <button className="ReportFoundbtn">Report a Found Item</button>
          </div>
        </div>

        <div id="body3" className="body3">
          <div className="paragraphs5">
            <h1 className="text" id="h5">
              Report an Item that you Lost.
            </h1>
            <p>
              When reporting a missing item, please follow the necessary steps
              below to help us identify you and check for matching items based
              on your description.
            </p>
            <ul className="h4" id="text">
              <li>Please read the Terms and Conditions.</li>
              <li>Describe the item you lost.</li>
              <li>Fill out the Response Form.</li>
            </ul>
            <button className="ReportLostbtn" onClick={GoToReportLostItem}>
              Report a Missing Item
            </button>
          </div>
          <img src={Report2_Img} alt="NU Logo" className="large" id="large2" />
        </div>
      </div>
    </div>
  );
}

export default Homepage2;
