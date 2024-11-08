import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const EditReports = () => {
  const navigate = useNavigate();
  const [userDataWithInfo, setUserDataWithInfo] = useState([]);
  const [userDataFound, setUserDataFound] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({});
  const [editableFields, setEditableFields] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchUserData = async () => {
    const { data: pendingData, error: pendingError } = await supabase
      .from("item_reports2")
      .select("id, category, brand, color, datelost, timelost, locationlost, datefound, timefound, locationfound, objectname, imageurl, status")
      .eq("holderid", user.id)
      .eq("status", "pending");

    if (pendingError) {
      console.error("Error fetching user data:", pendingError);
    } else {
      const lostItems = pendingData.filter(report => report.datelost && report.timelost && report.locationlost);
      setUserDataWithInfo(lostItems);

      const foundItems = pendingData.filter(
        report => report.datefound && report.timefound && report.locationfound &&
                  !report.datelost && !report.timelost && !report.locationlost
      );
      setUserDataFound(foundItems);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const handleEditClickLost = (report) => {
    setSelectedReport(report);
    setFormData({ ...report });
    setEditableFields(["category", "brand", "color", "objectname", "datelost", "timelost", "locationlost"]);
  };

  const handleEditClickFound = (report) => {
    setSelectedReport(report);
    setFormData({ ...report });
    setEditableFields(["category", "brand", "color", "objectname", "datefound", "timefound", "locationfound"]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReport || !selectedReport.id) {
      console.error("No report selected or missing report ID");
      return;
    }

    const updates = {};
    for (const key in formData) {
      if (formData[key] !== selectedReport[key]) {
        updates[key] = formData[key] === "" ? null : formData[key];
      }
    }

    try {
      const { error } = await supabase
        .from("item_reports2")
        .update(updates)
        .eq("id", selectedReport.id);

      if (error) {
        console.error("Error updating report:", error);
        return;
      }

      alert("Report updated successfully!");
      setSelectedReport(null);
      await fetchUserData();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport || !selectedReport.id) {
      console.error("No report selected or missing report ID");
      return;
    }

    const { error } = await supabase
      .from("item_reports2")
      .delete()
      .eq("id", selectedReport.id);

    if (error) {
      console.error("Error deleting report:", error);
      return;
    }

    alert("Report deleted successfully!");
    setSelectedReport(null);
    await fetchUserData();
  };

  const renderInputField = (field) => {
    const fieldTypes = {
      datelost: "date",
      datefound: "date",
      timelost: "time",
      timefound: "time",
    };

    return (
      <label key={field}>
        {field.charAt(0).toUpperCase() + field.slice(1)}:
        <input
          type={fieldTypes[field] || "text"}
          name={field}
          value={formData[field] || ""}
          onChange={handleChange}
        />
      </label>
    );
  };

  return (
    <div>
      <h1>Hello, {user ? user.firstname : "Guest"}</h1>
      
      {userDataWithInfo.length > 0 && (
        <div>
          <h2>Lost Item Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Brand</th>
                <th>Color</th>
                <th>Date Lost</th>
                <th>Time Lost</th>
                <th>Location Lost</th>
                <th>Object Name</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userDataWithInfo.map((report, index) => (
                <tr key={index}>
                  <td>{report.category}</td>
                  <td>{report.brand}</td>
                  <td>{report.color}</td>
                  <td>{report.datelost}</td>
                  <td>{report.timelost}</td>
                  <td>{report.locationlost}</td>
                  <td>{report.objectname}</td>
                  <td>
                    {report.imageurl && <img src={report.imageurl} alt="Report" style={{ width: "50px" }} />}
                  </td>
                  <td>
                    <button type="button" onClick={() => handleEditClickLost(report)}>Edit</button>
                    <button type="button" onClick={() => { setSelectedReport(report); handleDelete(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {userDataFound.length > 0 && (
        <div>
          <h2>Found Item Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Brand</th>
                <th>Color</th>
                <th>Date Found</th>
                <th>Time Found</th>
                <th>Location Found</th>
                <th>Object Name</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userDataFound.map((report, index) => (
                <tr key={index}>
                  <td>{report.category}</td>
                  <td>{report.brand}</td>
                  <td>{report.color}</td>
                  <td>{report.datefound}</td>
                  <td>{report.timefound}</td>
                  <td>{report.locationfound}</td>
                  <td>{report.objectname}</td>
                  <td>
                    {report.imageurl && <img src={report.imageurl} alt="Report" style={{ width: "50px" }} />}
                  </td>
                  <td>
                    <button type="button" onClick={() => handleEditClickFound(report)}>Edit</button>
                    <button type="button" onClick={() => { setSelectedReport(report); handleDelete(); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div>
          <h2>Edit Report</h2>
          <form onSubmit={handleSubmit}>
            {editableFields.map((field) => renderInputField(field))}
            <button type="submit">Save Changes</button>
          </form>
          <button type="button" onClick={handleDelete}>Confirm Delete Report</button>
        </div>
      )}

      {userDataWithInfo.length === 0 && userDataFound.length === 0 && <p>No reports found.</p>}
      
      <button
        className="PrevBtn"
        type="button"
        onClick={() => {
          localStorage.setItem("scrollToSection", "Report3");
          navigate("/homepage");
        }}
      >
        Home
      </button>
    </div>
  );
};

export default EditReports;
