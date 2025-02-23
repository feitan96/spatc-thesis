import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set the role
        }
      } else {
        setUserRole(null); // Clear the role on logout
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);