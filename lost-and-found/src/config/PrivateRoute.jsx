import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Handle loading state
  }

  console.log(user);  // Debugging the user state

  if (!user) {
    return <Navigate to='/' replace={true} />; // Redirect if not authenticated
  }

  return children;
};

export default PrivateRoute;


/** t ensures that only authenticated users can access certain routes. 
 * If the user is not authenticated, they are redirected to the signup page (/signup).
 */

