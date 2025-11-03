import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../lib/firebase"; // ✅ your firebase config
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ------------------ Types ------------------ //
type AuthContextType = {
  user: FirebaseUser | null;
  authLoading: boolean;
  authError: string | null;
  signUp: (params: { email: string; password: string; username: string }) => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

// ------------------ Helpers ------------------ //
const getFriendlyError = (error: any): string => {
  if (!error || !error.code) return "Something went wrong. Please try again.";

  switch (error.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try signing in instead.";
    case "auth/invalid-email":
      return "The email address is not valid.";
    case "auth/weak-password":
      return "Your password is too weak. Please use at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait and try again later.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please check and try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

// ------------------ Context ------------------ //
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async ({ email, password, username }: { email: string; password: string; username: string }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1️⃣ Check if username already exists
      const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setAuthError("This username is already taken.");
        setAuthLoading(false);
        return;
      }

      // 2️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 3️⃣ Add user to Firestore
      await addDoc(collection(db, "users"), {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: username.toLowerCase(),
        aura: 0,
        bio: "",
        birthdate: null,
        createdAt: serverTimestamp(),
        fcmToken: "",
        followersCount: 0,
        followingCount: 0,
        gender: "",
        invitedBy: "",
        isVerified: false,
        name: "",
        profileLink: "",
        profileUrl: "",
        pronouns: "",
        soulNumber: null,
        totalStories: 0,
        lastUpdatedOn: serverTimestamp(),
        totalChecked: 0,
      });

      console.log("✅ User signed up and added to Firestore");

      // Auto-login after signup
      await signIn({ email, password });
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("isFirstTime", "false");
      setUser(result.user);
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error(err);
      setAuthError(getFriendlyError(err));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        authError,
        signUp,
        signIn,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
