// app/auth/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  firstName: string | null;
  setFirstName: (firstName: string | null) => void;
  lastName: string | null;
  setLastName: (lastName: string | null) => void;
  userId: string | null; // Add userId
  setUserId: (userId: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
  firstName: null,
  setFirstName: () => {},
  lastName: null,
  setLastName: () => {},
  userId: null, // Initialize userId
  setUserId: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Add userId state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
          setFirstName(userDoc.data().firstName);
          setLastName(userDoc.data().lastName);
          setUserId(userId); // Set userId
        }
      } else {
        setUserRole(null);
        setFirstName(null);
        setLastName(null);
        setUserId(null); // Clear userId on logout
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, firstName, setFirstName, lastName, setLastName, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);