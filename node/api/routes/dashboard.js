const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

router.get("/", jwtFilter, async (req, res) => {
  const { privilege } = req.decodedToken;

  if (privilege == 1) {
    const numberOfUsers = await query("SELECT privilege, COUNT(*) as number FROM users GROUP BY privilege");
    res.json({
      teachers: R.path(["number"], R.head(numberOfUsers.filter(item => item.privilege == 1))),
      students: R.path(["number"], R.head(numberOfUsers.filter(item => item.privilege == 2))),
      administrators: R.path(["number"], R.head(numberOfUsers.filter(item => item.privilege == 0)))
    });
  } else if (privilege == 2) {
    res.json("Nothing for you bro");
  } else {
    res.json("Nothing for you bro");
  }
});

module.exports = router;
