// -----------------------------
// Simple MERN API (Express + MongoDB via Mongoose)
// Features: Register, Login, CRUD items per user
// Notes:
// - This version keeps the same API shape your React app expects.
// - Passwords are stored in plain text here for simplicity (NOT for production).
//   See "Next steps" at the bottom for bcrypt + JWT.
// -----------------------------

// Load core libraries
const express = require("express");   // Web framework
const cors = require("cors");         // Allow cross-origin requests (React -> Express)
const mongoose = require("mongoose");
const dotenv=require("dotenv")
 // MongoDB ODM

// Create an Express app instance
const app = express();

// Middlewares (run for every request)
app.use(express.json()); // Parse JSON request bodies into req.body
app.use(cors({
  origin: [
    "https://ltpr.netlify.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

dotenv.config();
// Allow requests from your React app (default: all origins)

// -----------------------------
// Connect to MongoDB
// ----------------------------//
(async () => {
  try {
    // Use MongoDB Atlas URI from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // stop server if DB fails
  }
})();

// -----------------------------
// Mongoose Schemas and Models
// -----------------------------

// User Schema: represents a registered user
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },         // User's name
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,                                             // Prevent duplicate emails
      // unique creates an index; if you already have duplicates in DB, this can error on index build
    },
    password: { type: String, required: true },                 // Plain text here (for demo only)
  },
  { timestamps: true }                                          // Adds createdAt/updatedAt
);

// Build a User model from the schema
const User = mongoose.model("User", userSchema);

// Item Schema: represents a note/item that belongs to a user
const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },        // Item title
    description: { type: String, trim: true, default: "" },     // Item description
    // We store userId as a string to match what the frontend sends (user._id as string)
    // In a more robust app, you'd use: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// Build an Item model from the schema
const Item = mongoose.model("Item", itemSchema);

// -----------------------------
// AUTH ROUTES
// -----------------------------

// POST /register
// Purpose: Create a new user if the email doesn't already exist
app.post("/register", async (req, res) => {
  try {
    // Read data from the request body
    const { name, email, password } = req.body;

    // Basic validation (all required)
    if (!name || !email || !password) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    // Check if a user with this email already exists
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      // Conflict: email already registered
      return res.status(409).json({ status: "error", message: "Email already exists" });
    }

    // Create the new user (plain text password for demo)
    const user = await User.create({ name, email, password });

    // Respond with success and the new user's basic info
    return res.status(201).json({
      status: "Success",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    // Handle duplicate key error if unique index triggers
    if (err && err.code === 11000) {
      return res.status(409).json({ status: "error", message: "Email already exists" });
    }
    console.error("Register error:", err);
    return res.status(500).json({ status: "error", message: "Error registering user" });
  }
});

// POST /login
// Purpose: Verify email and password, then return user basic info
app.post("/login", async (req, res) => {
  try {
    // Read credentials from request body
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Not found: no user with that email
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Compare passwords (plain text check here; use bcrypt in production)
    if (user.password !== password) {
      // Unauthorized: wrong password
      return res.status(401).json({ status: "error", message: "Incorrect password" });
    }

    // Success: send user's basic info
    return res.json({
      status: "Success",
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ status: "error", message: "Error logging in" });
  }
});

// -----------------------------
// CRUD ROUTES (Items)
// -----------------------------

// POST /items
// Purpose: Create a new item belonging to a user
app.post("/items", async (req, res) => {
  try {
    // Read item data from the request body
    const { title, description, userId } = req.body;

    // Validate required fields
    if (!title || !userId) {
      return res.status(400).json({ status: "error", message: "Title and userId are required" });
    }

    // Optionally, verify the user actually exists (skip for speed if you want)
    // const userExists = await User.exists({ _id: userId });
    // if (!userExists) return res.status(404).json({ status: "error", message: "User not found" });

    // Create and save the new item
    const item = await Item.create({ title, description, userId });

    // Respond with the created item
    return res.status(201).json({ status: "Success", item });
  } catch (err) {
    console.error("Create item error:", err);
    return res.status(500).json({ status: "error", message: err.message || "Error creating item" });
  }
});

// GET /items/:userId
// Purpose: Get all items for a specific user (returns a plain array as your frontend expects)
app.get("/items/:userId", async (req, res) => {
  try {
    // Read userId from the URL params
    const { userId } = req.params;

    // Find all items that match this userId
    const items = await Item.find({ userId }).sort({ createdAt: -1 });

    // Return the array directly (your frontend expects res.data to be an array)
    return res.json(items);
  } catch (err) {
    console.error("Get items error:", err);
    return res.status(500).json({ status: "error", message: err.message || "Error fetching items" });
  }
});

// PUT /items/:id
// Purpose: Update an existing item by its MongoDB _id
app.put("/items/:id", async (req, res) => {
  try {
    // Read item ID from URL and new data from body
    const { id } = req.params;
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ status: "error", message: "Title and description are required" });
    }

    // Find and update the item; { new: true } returns the updated document
    const item = await Item.findByIdAndUpdate(id, { title, description }, { new: true });

    // If no item found with that ID
    if (!item) {
      return res.status(404).json({ status: "error", message: "Item not found" });
    }

    // Success: return the updated item
    return res.json({ status: "Success", item });
  } catch (err) {
    console.error("Update item error:", err);
    return res.status(500).json({ status: "error", message: err.message || "Error updating item" });
  }
});

// DELETE /items/:id
// Purpose: Delete an item by its MongoDB _id
app.delete("/items/:id", async (req, res) => {
  try {
    // Read item ID from URL
    const { id } = req.params;

    // Find and delete the item
    const deleted = await Item.findByIdAndDelete(id);

    // If no item found with that ID
    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Item not found" });
    }

    // Success: confirm deletion
    return res.json({ status: "Success", message: "Item deleted" });
  } catch (err) {
    console.error("Delete item error:", err);
    return res.status(500).json({ status: "error", message: err.message || "Error deleting item" });
  }
});

// -----------------------------
// Start the HTTP server
// -----------------------------
const PORT = process.env.PORT || 3001; // Allow overriding via env var if needed
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});