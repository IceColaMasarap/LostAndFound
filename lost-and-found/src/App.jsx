import { useState } from "react";
import SignUpForm from "./jsx/SignUpForm";
import Login from "./jsx/Login";
import "./styling/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./config/AuthComponent.jsx";
import Admin from "./jsx/admin";
import HomePage from "./jsx/homepage2.jsx";
import ReportFoundItem from "./jsx/ReportFoundItem.jsx";
import PrivateRoute from "./config/PrivateRoute.jsx";
import PublicRoute from "./config/PublicRoute.jsx";
function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignUpForm />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/homepage" element={<HomePage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/report-found-item" element={<PrivateRoute><ReportFoundItem/> </PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
