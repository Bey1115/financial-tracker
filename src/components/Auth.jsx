import { useEffect, useState } from "react";

// Simple auth using localStorage. Passwords are hashed with SHA-256 in the browser.
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // login or signup
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("ft_last_user");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) return setError("Provide username & password");

    const hash = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem("ft_users") || "{}");
    if (users[username]) return setError("User already exists");

    users[username] = { passwordHash: hash };
    localStorage.setItem("ft_users", JSON.stringify(users));
    localStorage.setItem("ft_last_user", username);

    // initialize empty data for this user if default exists
    const defaultData = JSON.parse(localStorage.getItem("ft_default_data") || "null");
    if (defaultData) {
      localStorage.setItem(`ft_data_${username}`, JSON.stringify(defaultData));
    }

    onLogin(username);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) return setError("Provide username & password");

    const hash = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem("ft_users") || "{}");
    const user = users[username];
    if (!user || user.passwordHash !== hash) return setError("Invalid credentials");

    localStorage.setItem("ft_last_user", username);
    onLogin(username);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }}>
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="subtitle">Sign in to your tracker</p>
            <h2>{mode === "login" ? "Welcome back" : "Create an account"}</h2>
          </div>
        </div>

        <form className="modal-form" onSubmit={mode === "login" ? handleLogin : handleSignup}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          </label>

          {error && <div style={{ color: "#f87171" }}>{error}</div>}

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Create account" : "Have an account?"}</button>
            <button type="submit" className="primary-button">{mode === "login" ? "Sign in" : "Sign up"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
