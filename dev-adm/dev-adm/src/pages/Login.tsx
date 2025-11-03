import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router-dom";

type AuthModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type FormState = {
  username: string;
  email: string;
  password: string;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen = true, onClose }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
  });
  const { signUp, signIn, authLoading, authError, user } = useAuth();
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authError) {
      const errorCode = authError.match(/\(auth\/(.+?)\)/)?.[1];
      setLocalError(getReadableError(errorCode || authError));
    } else {
      setLocalError("");
    }
  }, [authError]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  if (!isOpen) return null;

  const getReadableError = (code: string): string => {
    switch (code) {
      case "email-already-in-use":
        return "This email is already registered.";
      case "invalid-email":
        return "The email address is not valid.";
      case "weak-password":
        return "Password should be at least 6 characters.";
      case "user-not-found":
        return "No account found with this email.";
      case "wrong-password":
        return "Incorrect password. Please try again.";
      case "too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await signIn({ email: form.email, password: form.password });
    } else {
      await signUp({
        email: form.email,
        username: form.username,
        password: form.password,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {localError && (
            <div className="text-sm text-red-500 text-center">{localError}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={authLoading}
          >
            {authLoading
              ? mode === "login"
                ? "Logging in..."
                : "Signing up..."
              : mode === "login"
              ? "Login"
              : "Signup"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-indigo-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-indigo-600 hover:underline"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
