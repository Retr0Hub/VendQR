const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static("static"));

// Serve an HTML page when visiting "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Templates", "index.html"));
});

// New route to serve data
app.get("/data.json", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "data.json"));

});

app.post("/generate-qrcode", async (req, res) => {
  try {
      const response = await axios.post("http://localhost:5000/generate-qrcode", req.body);
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: "Failed to generate QR code" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
