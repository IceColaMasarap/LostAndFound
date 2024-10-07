import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard"; // Import your Dashboard component
import LostItems from "./LostItems";
import Pending from "./Pending";
import Claimed from "./Claimed";
import All from "./All";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faHouse,
  faClock,
  faClipboardCheck,
  faBorderAll,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/logo.png";
import "./Admin.css";

function MainPage() {
  return (
    <div className="mainbody">
      <div className="sidebar">
        <img src={logo} alt="logo" className="logo2" />
        <ul>
          <li>
            <Link to="/adminpage/">
              {" "}
              <FontAwesomeIcon icon={faHouse} /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/adminpage/lostitems">
              <FontAwesomeIcon icon={faFileExcel} /> Lost Items
            </Link>
          </li>
          <li>
            <Link to="/adminpage/pending">
              <FontAwesomeIcon icon={faClock} /> Pending Claims
            </Link>
          </li>
          <li>
            <Link to="/adminpage/claimed">
              <FontAwesomeIcon icon={faClipboardCheck} /> Claimed Items
            </Link>
          </li>
          <li>
            <Link to="/adminpage/all">
              <FontAwesomeIcon icon={faBorderAll} /> All Reports
            </Link>
          </li>
        </ul>
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lostitems" element={<LostItems />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/claimed" element={<Claimed />} />
          <Route path="/all" element={<All />} />
        </Routes>
      </div>
    </div>
  );
}

export default MainPage;