import "../styling/homepage2.css";
import logo from "../assets/nulogo.svg";
import notif from "../assets/notif.svg";
import img1 from "../assets/info-1-1.png";
import img2 from "../assets/info-2-2.png";

function Homepage2() {
  return (
    <div className="homepage-main">
      <div className="navbar">
        <div className="start">
          <img src={logo} alt="NU Logo" className="logo" />
          <label>NU LOST AND FOUND DASMARIÑAS</label>
        </div>
        <nav className="nav">
          <a href="#body1">Home</a>
          <a href="#body2">Memorandum</a>
          <a href="#body3">Report</a>
        </nav>
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

        <div id="body3" className="body3">
          <img src={img1} alt="NU Logo" className="large" />
          <div className="paragraphs2">
            <h1 className="text" id="h5">
              Memorandum for the Disposal of Found Items.
            </h1>
            <ul className="h4" id="text">
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
      </div>
    </div>
  );
}

export default Homepage2;