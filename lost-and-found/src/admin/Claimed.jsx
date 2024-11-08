import React, { useState, useEffect } from "react";
import "./Admin.css";
import placeholder from "../assets/imgplaceholder.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faCheck,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient"; // Import Supabase client

function Claimed() {
  const [foundItems, setFoundItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [notificationText, setNotificationText] = useState(
    "Your lost item might have been matched."
  );
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [remark, setArchiveRemark] = useState("");
  const [claimerDetails, setClaimerDetails] = useState({
    claimedBy: "",
    claimContactNumber: "",
    claimEmail: "",
  });

  const fetchFoundItems = async () => {
    let query = supabase
      .from("item_reports2")
      .select(
        `
        *,
        userinfo:holderid (firstname, lastname, email, contact)
      `
      )
      .not("claimedby", "is", null) // Filter items where claimedby is not null
      .order("dateclaimed", { ascending: false }); // Order by createdat in descending order

    // Apply category and color filters
    if (categoryFilter) query = query.eq("category", categoryFilter);
    if (colorFilter) query = query.eq("color", colorFilter);

    // Apply date range filter for `dateclaimed`
    if (dateRange.start) {
      // Adjust the start date to the beginning of the day in local time
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
      query = query.gte("dateclaimed", startDate.toISOString());
    }

    if (dateRange.end) {
      // Adjust the end date to the end of the day in local time
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Set to the end of the day
      query = query.lte("dateclaimed", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching found items:", error);
    } else {
      const items = data.map((item) => ({
        ...item,
        userName:
          item.userinfo?.firstname && item.userinfo?.lastname
            ? `${item.userinfo.firstname} ${item.userinfo.lastname}`
            : "N/A",
      }));
      setFoundItems(items);
    }
  };

  // Fetch data using Supabase
  useEffect(() => {
    fetchFoundItems();
  }, [categoryFilter, colorFilter, dateRange]);

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString(undefined, options);
    const formattedTime = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <>
      <div className="adminnavbar">
        <div>
          <p className="header">Claimed Items</p>
          <div className="categoryx">
            <p>Filter</p>
            <select
              className="categorybutton"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Personal Belonging">Personal Belonging</option>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Others">Others</option>
            </select>

            <select
              className="categorybutton"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
            >
              <option value="">All Colors</option>
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Purple">Purple</option>
              <option value="Pink">Pink</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Gray">Gray</option>
            </select>

            <div className="dateDiv">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setDateRange((prev) => ({
                    ...prev,
                    start: newStart,
                    end: prev.end < newStart ? newStart : prev.end,
                  }));
                }}
              />
              <label className="tolabel">–</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
        <label className="adminh2">{foundItems.length}</label>
      </div>

      <div className="containerlostdata">
        {foundItems.map((item) => (
          <div key={item.id} className="lostitemcontainer">
            <img
              className="lostitemimg"
              src={item.imageurl || placeholder}
              alt="Lost Item"
            />
            <div className="lostitembody">
              <div className="lostitemtop">
                <label className="lostitemlabel">
                  {item.objectname || "N/A"}
                </label>
              </div>
              <div className="lostitembody1">
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Category</label>
                  <label className="lostitemlabel3">{item.category}</label>
                  <label className="lostitemlabel2">Brand</label>
                  <label className="lostitemlabel3">{item.brand}</label>
                  <label className="lostitemlabel2">Color</label>
                  <label className="lostitemlabel3">{item.color}</label>
                </div>
                <div className="lostitempanel1">
                  <label className="lostitemlabel2">Claimed by:</label>
                  <label className="lostitemlabel3">{item.claimedby}</label>
                  <label className="lostitemlabel2">Contact Number</label>
                  <label className="lostitemlabel3">
                    {item.claimcontactnumber}
                  </label>
                  <label className="lostitemlabel2">Email</label>
                  <label className="lostitemlabel3">{item.claimemail}</label>
                  <label className="lostitemlabel2">Date Claimed</label>
                  <label className="lostitemlabel3">
                    {formatDate(item.dateclaimed)}
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal logic remains unchanged */}
    </>
  );
}

export default Claimed;
