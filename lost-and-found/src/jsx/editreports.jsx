import React, { useState, useEffect } from "react";
import { supabase } from "../config/firebase"; // Adjust the path as needed

const EditReports = ({ reportId }) => {
  const [report, setReport] = useState(null);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("reports") // Replace with your actual table name
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) {
        console.error("Error fetching report:", error.message);
      } else {
        setReport(data);
        setNewDescription(data.description); // Assuming "description" is the field
      }
    };

    fetchReport();
  }, [reportId]);

  const handleUpdate = async () => {
    const { data, error } = await supabase
      .from("reports")
      .update({ description: newDescription }) // Update the description
      .eq("id", reportId);

    if (error) {
      console.error("Error updating report:", error.message);
    } else {
      alert("Report updated successfully!");
      setReport(data); // Update the local state with the new data
    }
  };

  return (
    <div>
      {report ? (
        <div>
          <h2>Edit Report</h2>
          <h3>{report.title}</h3> {/* Assuming there's a title field */}
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows="5"
            cols="40"
          />
          <br />
          <button onClick={handleUpdate}>Update Report</button>
        </div>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
};

export default EditReports;
