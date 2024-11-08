import { useState } from "react";
import SignUpForm from "./jsx/SignUpForm";
import Login from "./jsx/Login";
import "./styling/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./jsx/homepage2.jsx";
import ReportFoundItem from "./jsx/ReportFoundItem.jsx";

import AdminPage from "./admin/mainpage.jsx";
import ReportLostItem from "./jsx/ReportLostItem.jsx";
import Editreports from "./jsx/editreports.jsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUpForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/report-lost-item/*" element={<ReportLostItem />} />
          <Route path="/report-found-item/*" element={<ReportFoundItem />} />
          <Route path="/edit-reported-item/*" element={<Editreports />} />
          <Route path="/adminpage/*" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
