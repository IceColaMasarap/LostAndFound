import "./Admin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
function Dashboard() {
  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Dashboard</p>
          <p>Welcome to NU Lost and Found!</p>
        </div>
        <div>
          <input className="entercode" maxLength={6} placeholder="ENTER CODE" />
          <button className="codebtn" id="entercodebtn">
            <FontAwesomeIcon icon={faCheck} />
          </button>
        </div>
      </div>

      <div className="dashboardbody">
        <div className="panels">
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Lost Items</p>
          </div>
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Pending Claims</p>
          </div>
          <div className="panel">
            <p className="panelh2">100</p>
            <p className="panelp">Claimed Items</p>
          </div>
        </div>

        <div className="dashboardtable">
          <p className="ptag">Displaying Most Recent Lost Items</p>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Reported By</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th>Claimed By</th>
                </tr>
              </thead>
              <tbody>
                {/* Add your data rows here */}
                <tr>
                  <td>John Doe</td>
                  <td>Lost Item</td>
                  <td>Umbrella</td>
                  <td>2024-10-01</td>
                  <td>Pending</td>
                  <td></td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>Found Item</td>
                  <td>Backpack</td>
                  <td>2024-10-02</td>
                  <td>Claimed</td>
                  <td>John Doe</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
