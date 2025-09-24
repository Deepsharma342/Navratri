import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import "./App.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3001/login", { email, password });
      if (res.data.status === "Success") {
        localStorage.setItem("userId", res.data.userId);
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/home");
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: res.data.message || "Invalid credentials"
        });
      }
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.response?.data?.message || "Error logging in"
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
          <div className="logo">🔐</div>
          <h2>Welcome back</h2>
          <p>Sign in to continue</p>
        </div>

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

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input">
            <span className="icon">🔒</span>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? "Hide password" : "Show password"}
              title={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button className="submit" type="submit" disabled={loading || !email || !password}>
          {loading ? <span className="spinner" /> : "Login"}
        </button>

        <div className="meta">
          <a className="muted" href="#" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
          <span className="muted">
            New here? <Link to="/register">Create an account</Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;