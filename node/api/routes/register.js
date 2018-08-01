const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const R = require("ramda");

const { query } = global;

const router = express.Router();

/**
 * @api {post} /register Register user account
 * @apiName RegisterUserAccount
 * @apiGroup Register
 *
 * @apiParamExample {json} Request example:
 * {
 *   "name": "John Smith",
 *   "password": "supersecurepassword",
 *   "inviteCode": "NYKFV"
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    userId: 3,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.post("/", async (req, res) => {
  const { name, password, inviteCode } = req.body;
  const code = R.head(await query("SELECT * FROM invitation_codes WHERE code = ?", inviteCode));
  if (R.isNil(code))
    return res.json({ error: "Code not found!" });
  if (code.used)
    return res.json({ error: "Code already used!" });

  const hashedPassword = bcrypt.hashSync(password);

  const { insertId } = await query("INSERT INTO users (email, password, privilege, name) VALUES (?, ?, ?, ?)",
    [ code.email, hashedPassword, code.privilege, name ]);

  await query("UPDATE invitation_codes SET used = 1 WHERE code = ?", inviteCode);

  res
    .status(201)
    .json(R.head(await query("SELECT userId, email, name, privilege FROM users WHERE userId = ?", insertId)));
});

module.exports = router;
