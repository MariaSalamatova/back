const router = require("express").Router();
// const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mockUsers = [];

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  // await user.save();
  mockUsers.push(user);
  res.status(201).send("Registered");
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // const user = await User.findOne({ email });
  const user = mockUsers.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send("Invalid credentials");
  }
  // const token = jwt.sign({ id: user._id }, "secretkey");
  const token = jwt.sign({ email: user.email }, "secretkey");

  res.json({ token, user: { username: user.username } });
});

router.post("/logout", (req, res) => {
  res.send("Logget out !!!!");
});

module.exports = router;
