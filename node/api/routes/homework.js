const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

// Add homework
// Required params:
// - groupId (int)
// - title (string)
// - tags (array)
router.post("/", async (req, res) => {
  const { groupId } = req.body;
});

module.exports = router;
