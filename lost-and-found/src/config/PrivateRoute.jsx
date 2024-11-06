import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Handle loading state
  }

  if (!user) {
    return <Navigate to="/" replace={true} />; // Redirect if not authenticated
  }

  // Check if the route is admin-only and if the user is not an admin
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/homepage" replace={true} />; // Redirect non-admin users
  }

  return children;
};

export default PrivateRoute;
