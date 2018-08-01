const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body;
  const user = R.head(await query("SELECT name, privilege, password FROM users WHERE email = ?", email));
  res.json(user);
});

module.exports = router;
