import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true); // 🔑 IMPORTANT

  // 🔹 Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("fitfuzzUser");
    const savedSeller = localStorage.getItem("fitfuzzSeller");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedSeller) {
      setSeller(JSON.parse(savedSeller));
    }

    setLoading(false); // 🔑 auth ready
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
    <AuthContext.Provider
      value={{
        user,
        seller,
        loading, // 🔑 expose loading
        login,
        logout,
        sellerLogin,
        sellerLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
