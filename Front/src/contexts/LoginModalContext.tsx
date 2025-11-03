import React, { createContext, useContext, useState } from "react";

type LoginModalContextType = {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  toggleLogin: () => void;
};

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export const LoginModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const toggleLogin = () => setIsLoginOpen((prev) => !prev);

  return (
    <LoginModalContext.Provider value={{ isLoginOpen, openLogin, closeLogin, toggleLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used inside LoginModalProvider");
  return ctx;
};
