import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // Import Firebase auth
import { supabase } from "./firebase"; // Import Supabase client
import PropTypes from "prop-types";

// Create the AuthContext with default values
export const AuthContext = createContext({
  user: null,
  isLoading: true,
});

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Handle loading state

  // UseEffect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("User detected:", firebaseUser); // Debugging: Verify if user is detected
      if (firebaseUser) {
        try {
          // Fetch additional user details from Supabase
          const { data: userRecord, error } = await supabase
            .from("users")
            .select("id, firstName, lastName, contact, is_admin")
            .eq("id", firebaseUser.uid) // Assuming "id" matches Firebase UID
            .single();

          if (error) {
            console.error("Error fetching user details from Supabase:", error);
          } else if (userRecord) {
            // Set user details, including Supabase data
            setUser({
              id: firebaseUser.uid,
              name: `${userRecord.firstName} ${userRecord.lastName}`,
              email: firebaseUser.email,
              contact: userRecord.contact,
              is_admin: userRecord.is_admin,
            });
          } else {
            console.error("No such document in Supabase!");
          }
        } catch (error) {
          console.error("Error fetching user details from Supabase:", error);
        }
      } else {
        setUser(null); // User is not logged in
      }
      setIsLoading(false);
    });

    // Cleanup the listener on unmount
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
