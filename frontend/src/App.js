import React, { useState } from "react";

import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  const handleLogin = (data) => {
    setToken(data.access_token);
    setUser(data.user);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPage("login");
  };

  if (!token) {
    return page === "register" ? (
      <Register
        onRegister={() => setPage("login")}
        onShowLogin={() => setPage("login")}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setPage("register")}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      token={token}
      onLogout={handleLogout}
    />
  );
}

export default App;