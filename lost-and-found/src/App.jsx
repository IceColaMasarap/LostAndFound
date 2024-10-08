import { useState } from "react";
import SignUpForm from "./jsx/SignUpForm";
import Login from "./jsx/Login";
import "./styling/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./config/AuthComponent.jsx";

import HomePage from "./jsx/homepage2.jsx";
import ReportFoundItem from "./jsx/ReportFoundItem.jsx";
import PrivateRoute from "./config/PrivateRoute.jsx";
import PublicRoute from "./config/PublicRoute.jsx";
import AdminPage from "./admin/mainpage.jsx";
import ReportLostItem from "./jsx/ReportLostItem.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignUpForm />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/report-lost-item" element={<ReportLostItem />} />
            <Route
              path="/report-found-item"
              element={
                <PrivateRoute>
                  <ReportFoundItem />{" "}
                </PrivateRoute>
              }
            />
            
            <Route path="/adminpage/*" element={<AdminPage />}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
