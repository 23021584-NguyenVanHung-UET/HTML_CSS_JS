const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const SECRET_KEY = "mysecret";

app.use(bodyParser.json());
app.use(cors()); // 🔑 Cho phép mọi domain gọi API

// Fake user
const USER = { username: "alice", password: "123456" };

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign(
      { user: username },
      SECRET_KEY,
      { expiresIn: "30m" }
    );
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Middleware kiểm tra token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Protected endpoint
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.user}! This is your profile.` });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
