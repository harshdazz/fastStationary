import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  uid: string;
  email: string;
  createdAt?: any; // Firestore timestamp or Date
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  notes?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  loginOrSignup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  loginOrSignup: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const firebaseErrorMessages: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/user-not-found": "No account found with that email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters long."
  };

  /**
   * Listens to Firebase auth state changes and fetches user data from Firestore.
   * This is the single source of truth for user and userData state.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Always set loading to true when auth state changes
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          } else {
            // This is for new users who have just signed up and
            // their Firestore profile hasn't been created yet.
            setUserData(null);
          }
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        // User has logged out
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]); // Dependency array ensures listener is set up once

  const loginOrSignup = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        // Existing user: sign in
        await signInWithEmailAndPassword(auth, email, password);
        // The onAuthStateChanged listener will handle fetching userData
      } else {
        // New user: create the user and their Firestore profile
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const newUserData: UserData = {
          uid: cred.user.uid,
          email: cred.user.email || "",
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, "users", cred.user.uid), newUserData);
        // The onAuthStateChanged listener will handle fetching userData
      }
    } catch (err: any) {
      const code = err.code || "unknown";
      const message = firebaseErrorMessages[code] || "Something went wrong. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will handle setting the state to null
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, loginOrSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);