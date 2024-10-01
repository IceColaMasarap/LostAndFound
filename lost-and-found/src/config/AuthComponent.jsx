import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "./firebase"; // Import Firebase auth configuration
import PropTypes from 'prop-types';
// Rename this function to avoid conflict
export const AuthComponent = () => {
  return (
    <div>auth</div>
  );
};

// Create the context with default values
export const AuthContext = createContext({
    user: null,
    isLoading: true,
});

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    // Manage user and loading state
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // to handle loading state

    // Use effect to listen for auth state changes
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("User detected:", user); // Add this to verify user detection
        if (user) {
          setUser({
            id: user.uid,
            name: user.displayName || "Anonymous",
            email: user.email || "",
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    }, []);

    // Value passed to the provider's consumers
    const value = {
      user,
      isLoading,
    };

    return (
      <AuthContext.Provider value={value}>
        {!isLoading && children}
      </AuthContext.Provider>
    );
};

// Define PropTypes for prop validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
