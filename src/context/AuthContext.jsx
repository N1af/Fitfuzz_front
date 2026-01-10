import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);

  // 🔹 Load from localStorage on mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("fitfuzzUser"));
    if (savedUser) setUser(savedUser);

    const savedSeller = JSON.parse(localStorage.getItem("fitfuzzSeller"));
    if (savedSeller) setSeller(savedSeller);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fitfuzzUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitfuzzUser");
  };

  const sellerLogin = (sellerData) => {
    setSeller(sellerData);
    localStorage.setItem("fitfuzzSeller", JSON.stringify(sellerData));
  };

  const sellerLogout = () => {
    setSeller(null);
    localStorage.removeItem("fitfuzzSeller");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, seller, sellerLogin, sellerLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
