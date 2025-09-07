const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 5000;

// Serve index.html from the correct directory
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Enable CORS & static files
app.use(cors());
app.use(express.json()); 
app.use("/static", express.static(path.join(__dirname, "static")));

// Endpoint to save order & generate QR code
app.post("/generate-qrcode", async (req, res) => {
  try {
    const response = await fetch("http://localhost:5000/generate-qrcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body) // Pass actual request body
    });

    const data = await response.json();
    console.log(data);
    
    res.json(data);  // Send response back to frontend
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// ✅ Move server start here!
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
