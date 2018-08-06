const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const router = express.Router();


/**
 * @api {post} /login Authenticate user
 * @apiName Login
 * @apiGroup Login
 *
 * @apiParamExample {json} Request example:
 * {
 *   "email": "john_smith@gmail.com",
 *   "password": "supersecurepassword"
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5fc21pdGhAZ21haWwuY29tIiwibmFtZSI6IkpvaG4gU21pdGgiLCJwcml2aWxlZ2UiOjEsImlhdCI6MTUzMzA5NjYyNH0.9o8iQTOp1-p8s8gDV9bgY6lzg1Y2K-Zvilp_nLHN6zo"
 * }
 *
 * @apiErrorExample {json} Error: User not found
 * HTTP 200
 * {
 *    "error": "User account not found!"
 * }
 *
 * @apiErrorExample {json} Error: Incorrect credentials
 * HTTP 200
 * {
 *    "error": "Incorrect credentials!"
 * }
 */
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const user = R.head(await query("SELECT userId, name, privilege, password FROM users WHERE email = ?", email));
  if (R.isNil(user)) 
    return res.json({
      error: "User account not found!"
    });

  if (bcrypt.compareSync(password, user.password)) {
    const tokenContent = {
      email,
      name: user.name,
      privilege: user.privilege,
      userId: user.userId
    };
    const token = jwt.sign(tokenContent, process.env.JWT_SECRET);
    return res.json({ token });
  } else {
    return res.json({
      error: "Incorrect credentials!"
    });
  }
});

module.exports = router;
