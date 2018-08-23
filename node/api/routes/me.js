const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

/**
 * @api {get} /me Get current user information
 * @apiName Me
 * @apiGroup Me
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   email: "john_smith@gmail.com",
 *   name: "John Smith",
 *   privilege: 1,
 *   groupId: 1,
 *   userId: 3
 * }
 */

router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const groups = await query("SELECT group_id FROM group_user WHERE user_id = ? AND active = 1 LIMIT 1", userId);
  const group = groups.length && groups[0];
  if (group) {
    res.json(R.assoc("groupId", group.group_id, req.decodedToken));
  } else {
    res.json(req.decodedToken);
  }
});

module.exports = router;
