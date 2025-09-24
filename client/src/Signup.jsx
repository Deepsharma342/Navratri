// Signup.jsx — Registration screen with SweetAlert2, strength meter, and show/hide password

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./App.css";

// Create a reusable "toast"
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  timer: 1800,
  timerProgressBar: true,
  showConfirmButton: false,
});

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showCPass, setShowCPass] = useState(false);

  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const passwordsMatch = confirm === password || confirm.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.fire({ icon: "warning", title: "Please fill all fields" });
      return;
    }

    if (!passwordsMatch) {
      Swal.fire({ icon: "error", title: "Passwords do not match" });
      return;
    }

    setLoading(true);

    Swal.fire({
      title: "Creating your account...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Use VITE_API_URL or fallback to localhost 3001
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const res = await axios.post(`${API_URL}/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res.data.status === "Success") {
        Swal.close();

        await Swal.fire({
          icon: "success",
          title: "Registration successful!",
          text: "You can now log in.",
          timer: 1400,
          showConfirmButton: false,
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: res.data.message || "Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: err?.response?.data?.message || "Error registering",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="gradient-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand">
          <div className="logo">✨</div>
          <h2>Create your account</h2>
          <p className="muted">Join us in a few seconds</p>
        </div>

        {/* Name */}
        <div className="field">
          <label htmlFor="name">Name</label>
          <div className="input">
            <span className="icon">🧑</span>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email */}
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input">
            <span className="icon">📧</span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input">
            <span className="icon">🔒</span>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="8+ characters, mix of types"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPass((s) => !s)}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="strength">
            <div className="bars">
              <span className={`bar ${strength.score > 0 ? "active s1" : ""}`} />
              <span className={`bar ${strength.score > 1 ? "active s2" : ""}`} />
              <span className={`bar ${strength.score > 2 ? "active s3" : ""}`} />
              <span className={`bar ${strength.score > 3 ? "active s4" : ""}`} />
            </div>
            <small className="muted">{strength.label}</small>
          </div>
        </div>

        {/* Confirm password */}
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <div className="input">
            <span className="icon">✅</span>
            <input
              id="confirm"
              type={showCPass ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowCPass((s) => !s)}
            >
              {showCPass ? "🙈" : "👁️"}
            </button>
          </div>
          {!passwordsMatch && (
            <small style={{ color: "#fecaca" }}>Passwords do not match</small>
          )}
        </div>

        {/* Submit */}
        <button
          className="submit"
          type="submit"
          disabled={
            loading || !name.trim() || !email.trim() || !password.trim() || !passwordsMatch
          }
        >
          {loading ? <span className="spinner" /> : "Sign up"}
        </button>

        <div className="meta" style={{ marginTop: 12 }}>
          <span className="muted">
            Already have an account? <Link to="/login">Log in</Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Signup;

// Password strength helper
function getStrength(pwd = "") {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}
