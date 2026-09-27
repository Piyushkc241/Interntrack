import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The token lives in an httpOnly cookie we can't read from JS, so on
  // mount we just ask the backend "who am I?" — the cookie rides along
  // automatically (api.js sets withCredentials: true).
  useEffect(() => {
    api
      .get("/users/me")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/users/login", { email, password });
    setUser(data.user);
  }

  async function register(name, email, phone, password) {
    const { data } = await api.post("/users", { name, email, phone, password });
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post("/users/logout");
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
