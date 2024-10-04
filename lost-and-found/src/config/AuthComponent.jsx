import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; 
import { auth } from "./firebase"; // Import your Firebase config

export const AuthContext = createContext({
    user: null,
    isLoading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user); // Set the authenticated user
        } else {
          setUser(null); // Set user to null if not authenticated
        }
        setIsLoading(false); // Set loading to false when the user state is resolved
      });

      return () => unsubscribe();
    }, []);

    return (
      <AuthContext.Provider value={{ user, isLoading }}>
        {children}
      </AuthContext.Provider>
    );
};


