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
 *   privileg: 1
 * }
 */

router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const group = R.head(await query("SELECT groupId FROM group_user WHERE userId = ? LIMIT 1", userId));
  res.json(R.assoc("groupId", group.groupId, req.decodedToken));
});

module.exports = router;
