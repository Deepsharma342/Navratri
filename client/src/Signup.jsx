// Signup.jsx — Registration screen with SweetAlert2, strength meter, and show/hide password
// Requirements:
// 1) npm i axios sweetalert2
// 2) Import SweetAlert2 CSS once (in App.jsx or main.jsx):
//    import "sweetalert2/dist/sweetalert2.min.css";

import React, { useState, useMemo } from "react";   // React + hooks for state/memos
import { Link, useNavigate } from "react-router-dom"; // Link for routing + navigate programmatically
import axios from "axios";                           // HTTP client for API calls
import Swal from "sweetalert2";                      // SweetAlert2 for dialogs/toasts
import "./App.css";                                  // Your global styles (glassmorphism, gradient, etc.)

// Create a reusable "toast" (small popup) using SweetAlert2
const Toast = Swal.mixin({
  toast: true,                 // Make it a toast (small, corner popup)
  position: "top-end",         // Show at top-right
  timer: 1800,                 // Auto close after 1.8s
  timerProgressBar: true,      // Progress bar shows time remaining
  showConfirmButton: false,    // No "OK" button
});

// Functional component: Signup page
const Signup = () => {
  // Hook for navigation (redirect after success)
  const navigate = useNavigate();

  // Form fields state (controlled inputs)
  const [name, setName] = useState("");             // User's name
  const [email, setEmail] = useState("");           // User's email
  const [password, setPassword] = useState("");     // Password
  const [confirm, setConfirm] = useState("");       // Confirm password

  // UI toggles (show/hide password fields)
  const [showPass, setShowPass] = useState(false);  // Show/hide primary password
  const [showCPass, setShowCPass] = useState(false);// Show/hide confirm password

  // Loading state (disables submit and can show spinner)
  const [loading, setLoading] = useState(false);

  // Derive password strength from helper; re-calc only when password changes
  const strength = useMemo(() => getStrength(password), [password]);

  // Check if confirm matches password (or if confirm is empty, don't show error yet)
  const passwordsMatch = confirm === password || confirm.length === 0;

  // Handle form submission (Register user)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop default form submit (page reload)

    // Basic validation: all fields required
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.fire({ icon: "warning", title: "Please fill all fields" });
      return; // Stop here if invalid
    }

    // Confirm passwords must match
    if (!passwordsMatch) {
      Swal.fire({ icon: "error", title: "Passwords do not match" });
      return; // Stop here if mismatch
    }

    // Optional: enforce stronger passwords (uncomment to enforce)
    // if (strength.score < 3) {
    //   Swal.fire({ icon: "warning", title: "Weak password", text: "Try adding numbers, uppercase letters, or symbols." });
    //   return;
    // }

    // Start loading UI (disable button)
    setLoading(true);

    // Show a SweetAlert loading dialog while the API call runs
    Swal.fire({
      title: "Creating your account...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Call your backend /register endpoint with the form data
      const res = await axios.post("http://localhost:3001/register", {
        name: name.trim(),
        email: email.trim(),
        password, // send as typed (note: in production, server should hash this)
      });

      // Backend returns { status: "Success", ... } on success
      if (res.data.status === "Success") {
        // Close loading dialog
        Swal.close();

        // Show success message briefly
        await Swal.fire({
          icon: "success",
          title: "Registration successful!",
          text: "You can now log in.",
          timer: 1400,
          showConfirmButton: false,
        });

        // Redirect to login page
        navigate("/login");
      } else {
        // Server responded but not successful (e.g., email exists)
        Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: res.data.message || "Please try again.",
        });
      }
    } catch (err) {
      // Network error or server error
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: err?.response?.data?.message || "Error registering",
      });
    } finally {
      // Always turn off loading at the end
      setLoading(false);
    }
  };

  // Render the UI (glass card on gradient background)
  return (
    <div className="login-page"> {/* Fullscreen gradient background + center content */}
      {/* Floating gradient blobs for background flair */}
      <div className="gradient-bg">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* The glassmorphism card that holds the form */}
      <form className="login-card" onSubmit={handleSubmit}>
        {/* Brand header (icon + title + subtitle) */}
        <div className="brand">
          <div className="logo">✨</div>
          <h2>Create your account</h2>
          <p className="muted">Join us in a few seconds</p>
        </div>

        {/* Name field */}
        <div className="field">
          <label htmlFor="name">Name</label>
          <div className="input">
            <span className="icon">🧑</span>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)} // keep state in sync with input
              required
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email field */}
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input">
            <span className="icon">📧</span>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // update email state
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password field + show/hide + strength meter */}
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input">
            <span className="icon">🔒</span>
            <input
              id="password"
              type={showPass ? "text" : "password"} // toggle visibility
              placeholder="8+ characters, mix of types"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // update password state
              required
              autoComplete="new-password"
            />
            {/* Show/hide password button */}
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

          {/* Password strength meter (visual feedback only) */}
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

        {/* Confirm password field + show/hide */}
        <div className="field">
          <label htmlFor="confirm">Confirm password</label>
          <div className="input">
            <span className="icon">✅</span>
            <input
              id="confirm"
              type={showCPass ? "text" : "password"} // toggle visibility
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)} // update confirm state
              required
              autoComplete="new-password"
            />
            {/* Show/hide confirm password */}
            <button
              type="button"
              className="toggle"
              onClick={() => setShowCPass((s) => !s)}
              aria-label={showCPass ? "Hide password" : "Show password"}
              title={showCPass ? "Hide password" : "Show password"}
            >
              {showCPass ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Inline helper text if the two passwords don't match */}
          {!passwordsMatch && (
            <small style={{ color: "#fecaca" }}>Passwords do not match</small>
          )}
        </div>

        {/* Submit button (disabled while loading or invalid) */}
        <button
          className="submit"
          type="submit"
          disabled={
            loading ||                   // disable while submitting
            !name.trim() ||              // require name
            !email.trim() ||             // require email
            !password.trim() ||          // require password
            !passwordsMatch              // must match confirm
          }
        >
          {/* Show spinner while loading; otherwise the text */}
          {loading ? <span className="spinner" /> : "Sign up"}
        </button>

        {/* Footer link to login */}
        <div className="meta" style={{ marginTop: 12 }}>
          <span className="muted">
            Already have an account? <Link to="/login">Log in</Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Signup; // Export component so router can render it

// Helper: calculate password strength (very simple heuristic)
// Returns an object: { score: 0..4, label: string }
function getStrength(pwd = "") {
  let score = 0;
  if (pwd.length >= 8) score++;            // +1 if at least 8 characters
  if (/[A-Z]/.test(pwd)) score++;          // +1 if contains uppercase
  if (/[0-9]/.test(pwd)) score++;          // +1 if contains a digit
  if (/[^A-Za-z0-9]/.test(pwd)) score++;   // +1 if contains a symbol
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"]; // Labels per score
  return { score, label: labels[score] };  // Map score to label
}