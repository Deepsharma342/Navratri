// Home.jsx — Dashboard page with CRUD using Axios + SweetAlert2
// Prereqs:
// 1) npm i axios sweetalert2
// 2) Import SweetAlert2 CSS once in your root (App.jsx or main.jsx):
//    import "sweetalert2/dist/sweetalert2.min.css";

import React, { useState, useEffect } from "react";  // React and hooks
import axios from "axios";                           // HTTP client
import { useNavigate } from "react-router-dom";     // Navigation between routes
import Swal from "sweetalert2";                     // Beautiful alerts/toasts
import "./App.css";                                 // Global styles for the UI

// Create a pre-configured Axios instance.
// All API calls will use this base URL so we don't repeat it.
const api = axios.create({
  baseURL: "http://localhost:3001",                 // Your Express server port
});

// Configure a reusable SweetAlert2 "toast" (small popup) for quick success/error messages.
const Toast = Swal.mixin({
  toast: true,                                      // Use toast mode (small, corner)
  position: "top-end",                              // Show in top right corner
  timer: 2000,                                      // Auto close after 2s
  timerProgressBar: true,                           // Show a progress bar
  showConfirmButton: false,                         // No OK button for toasts
});

// Functional React component for the Home (dashboard) page
const Home = () => {
  const navigate = useNavigate();                   // Hook for programmatic navigation

  // State to store all items for the logged-in user
  const [items, setItems] = useState([]);           // Array of { _id, title, description }

  // State for the "Add Item" form inputs
  const [title, setTitle] = useState("");           // Title input value
  const [description, setDescription] = useState(""); // Description input value

  // UI state flags
  const [loading, setLoading] = useState(true);     // True while fetching initial items
  const [adding, setAdding] = useState(false);      // True while posting a new item

  // Read userId from localStorage (saved at login). This identifies the user's items.
  const userId = localStorage.getItem("userId");

  // Effect: runs on first render and whenever userId or navigate changes.
  // Purpose: If not logged in, redirect to /login. Otherwise, fetch user's items.
  useEffect(() => {
    // If no userId, user is not logged in -> go to login page
    if (!userId) {
      navigate("/login");
      return;                                       // Stop running the rest
    }

    setLoading(true);                                // Start loading spinner
    // GET /items/:userId -> fetch all items for this user
    api
      .get(`/items/${userId}`)
      .then((res) => setItems(res.data))            // Save the list of items into state
      .catch((err) => console.error(err))           // Log any errors
      .finally(() => setLoading(false));            // Stop loading spinner
  }, [userId, navigate]);                           // Dependencies: run if these change

  // Add a new item for this user
  const handleAdd = async () => {
    // Trim whitespaces from inputs
    const t = title.trim();
    const d = description.trim();

    // Validate: both fields are required
    if (!t || !d) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill title and description.",
      });
      return;                                       // Stop if invalid
    }

    setAdding(true);                                 // Disable add button + show spinner
    try {
      // POST /items { title, description, userId } -> create a new item
      const res = await api.post("/items", { title: t, description: d, userId });

      // Append the created item to the current list
      setItems((prev) => [...prev, res.data.item]);

      // Clear the form fields
      setTitle("");
      setDescription("");

      // Show success toast
      Toast.fire({ icon: "success", title: "Item added" });
    } catch (e) {
      // Show error dialog
      Swal.fire({ icon: "error", title: "Failed to add item" });
    } finally {
      setAdding(false);                              // Re-enable add button
    }
  };

  // Delete an item by ID (with user confirmation)
  const handleDelete = async (id) => {
    // Ask the user to confirm the deletion
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this item?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });

    // If user clicked "Cancel", do nothing
    if (!result.isConfirmed) return;

    try {
      // DELETE /items/:id -> remove this item
      await api.delete(`/items/${id}`);

      // Remove item from state by filtering it out
      setItems((prev) => prev.filter((item) => item._id !== id));

      // Show success toast
      Toast.fire({ icon: "success", title: "Item deleted" });
    } catch {
      // Show error dialog if API call fails
      Swal.fire({ icon: "error", title: "Failed to delete" });
    }
  };

  // Edit an item (opens a SweetAlert dialog with two inputs)
  const handleEdit = async (item) => {
    // Show a SweetAlert with two input fields pre-filled with current values
    const result = await Swal.fire({
      title: "Edit item",
      // Custom HTML for two inputs; we sanitize values with escapeHtml to avoid injection
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${escapeHtml(
          item.title || ""
        )}">
        <input id="swal-desc" class="swal2-input" placeholder="Description" value="${escapeHtml(
          item.description || ""
        )}">
      `,
      focusConfirm: false,                           // Don't auto-focus the confirm button
      showCancelButton: true,                        // Show "Cancel" button
      confirmButtonText: "Save",                     // Confirm button text
      cancelButtonText: "Cancel",                    // Cancel button text
      // Validate and collect input values before closing
      preConfirm: () => {
        const titleEl = document.getElementById("swal-title"); // Grab the title input
        const descEl = document.getElementById("swal-desc");   // Grab the desc input
        const t = titleEl.value.trim();                        // Trim title
        const d = descEl.value.trim();                         // Trim description

        // If either is empty, show a validation message and keep the dialog open
        if (!t || !d) {
          Swal.showValidationMessage("Both fields are required");
          return;                                              // Returning nothing cancels confirm
        }

        // Return the new values; SweetAlert will put this in result.value
        return { title: t, description: d };
      },
    });

    // If the user canceled or validation failed, do nothing
    if (!result.isConfirmed || !result.value) return;

    try {
      // PUT /items/:id with the new values -> update on server
      const res = await api.put(`/items/${item._id}`, result.value);

      // Update the item in local state to reflect changes
      setItems((prev) => prev.map((it) => (it._id === item._id ? res.data.item : it)));

      // Show success toast
      Toast.fire({ icon: "success", title: "Item updated" });
    } catch {
      // Show error dialog if update fails
      Swal.fire({ icon: "error", title: "Update failed" });
    }
  };

  // Logout flow (confirmation -> clear storage -> redirect to login)
  const handleLogout = async () => {
    // Ask for confirmation
    const result = await Swal.fire({
      icon: "question",
      title: "Log out?",
      text: "You will need to log in again.",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Stay",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });

    // If user canceled, stop here
    if (!result.isConfirmed) return;

    // Remove the saved userId to "log out" locally
    localStorage.removeItem("userId");

    // Show a quick success message
    await Swal.fire({
      icon: "success",
      title: "Logged out",
      timer: 1000,
      showConfirmButton: false,
    });

    // Navigate to the login page
    navigate("/login");
  };

  // JSX to render the UI
  return (
    <div className="dashboard-page">                 {/* Page wrapper with background */}
      <div className="gradient-bg">                  {/* Floating gradient blobs */}
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="dashboard">                    {/* Content wrapper for max-width */}
        {/* Header with brand and logout */}
        <header className="dashboard-header">
          <div className="brand">                    {/* App mini-branding */}
            <div className="logo">🗂️</div>          {/* Small gradient logo box */}
            <h2>Your Dashboard</h2>                  {/* Page title */}
            <p className="muted">                    {/* Subtext with item count */}
              {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* Add new item card */}
        <section className="glass-card add-card">
          <h3>Add Item</h3>
          <div className="fields">                   {/* Grid: title, description, button */}
            <div className="input with-icon">        {/* Styled input wrapper with icon */}
              <span className="icon">📝</span>       {/* Icon for title */}
              <input
                placeholder="Title"                  // Input placeholder
                value={title}                        // Controlled value from state
                onChange={(e) => setTitle(e.target.value)} // Update state on change
              />
            </div>

            <div className="input with-icon">        {/* Styled input wrapper with icon */}
              <span className="icon">💬</span>       {/* Icon for description */}
              <input
                placeholder="Description"            // Input placeholder
                value={description}                  // Controlled value
                onChange={(e) => setDescription(e.target.value)} // Update state
              />
            </div>

            <button
              className="btn btn-primary"            // Gradient button
              onClick={handleAdd}                    // Call add handler
              disabled={adding || !title.trim() || !description.trim()} // Disable if invalid/adding
            >
              {adding ? <span className="spinner" /> : "Add"} {/* Show spinner while adding */}
            </button>
          </div>
        </section>

        {/* Items list (loading -> empty -> grid) */}
        <section>
          {loading ? (                               // If still fetching, show spinner
            <div className="center">
              <span className="spinner lg" />
            </div>
          ) : items.length === 0 ? (                 // If no items, show empty state
            <div className="empty">
              <div className="logo">✨</div>
              <h4>No items yet</h4>
              <p className="muted">Add your first item using the form above.</p>
            </div>
          ) : (                                      // Otherwise, show items in a grid
            <div className="items-grid">
              {items.map((item) => (                 // Loop through items
                <div className="item-card glass-card" key={item._id}>
                  <div className="item-header">
                    <h4>{item.title}</h4>            {/* Item title */}
                    <div className="actions">        {/* Edit/Delete buttons */}
                      <button
                        className="icon-btn"
                        onClick={() => handleEdit(item)} // Open edit dialog for this item
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(item._id)} // Confirm + delete
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="muted">{item.description}</p> {/* Item description */}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;                                   // Export component as default

// Utility: escape HTML special characters to avoid breaking the SweetAlert input HTML.
// This prevents XSS or malformed HTML when we inject existing values into the dialog.
function escapeHtml(str = "") {
  // Replace characters like <, >, &, " and ' with their HTML-escaped versions
  return str.replace(/[&<>"']/g, (m) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}