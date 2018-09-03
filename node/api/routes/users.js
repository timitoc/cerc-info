const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const R = require("ramda");

const { query } = global;

const router = express.Router();

const jwtFilter = require("../filters/jwt-filter.js");
const privilegeFilter = require("../filters/privilege-filter.js");
const adminFilter = privilegeFilter(2);

/**
 * @api {get} /users Get all users
 * @apiName GetUsers
 * @apiGroup Users
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 *   [
 *     {
 *        user_id: 1,
 *        name: "Johnny Smith",
 *        email: "johnny_smith@gmail.com",
 *        privilege: 0
 *     },
 *     {
 *        user_id: 2,
 *        name: "John Smith",
 *        email: "john_smith@gmail.com",
 *        privilege: 1
 *     }
 *   ]
 */
router.get("/", jwtFilter, adminFilter, async (req, res) => {
  res.json(await query("SELECT user_id, email, name, privilege FROM users"));
});

/**
 * @api {get} /users/:user_id Get user by id
 * @apiName GetUsersById
 * @apiGroup Users
 *
 * @apiParam {String} user_id The user id
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *    user_id: 2,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.get("/:user_id", jwtFilter, adminFilter, async (req, res) => {
  const { user_id } = req.params;
  res.json(R.head(await query("SELECT user_id, email, name, privilege FROM users WHERE user_id = ?", user_id)));
});

/**
 * @api {post} /users Add a new user
 * @apiName AddUser
 * @apiGroup Users
 *
 * @apiParamExample {json} Request example:
 * {
 *   "email": "john_smith@gmail.com",
 *   "password": "supersecurepassword"
 *   "privilege": 1
 *   "name": "John Smith"
 * }
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    user_id: 3,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.post("/", jwtFilter, adminFilter, async (req, res) => {
  const { email, password, privilege, name } = req.body;
  const hashedPassword = bcrypt.hashSync(password);

  const { insertId } = await query("INSERT INTO users (email, password, privilege, name) VALUES (?, ?, ?, ?)",
    [ email, hashedPassword, privilege, name ]);

  res
    .status(201)
    .json(R.head(await query("SELECT user_id, email, name, privilege FROM users WHERE user_id = ?", insertId)));
});

/**
 * @api {put} /users/:user_id Modify a user
 * @apiName ModifyUser
 * @apiGroup Users
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {Integer} user_id The user id
 *
 * @apiParamExample {json} Request example (only use the fields that you want to update):
 * {
 *   "name": "New Name",
 *   "email": "new_email@gmail.com",
 *   "password": "newsecurepassword",
 *   "privilege": 1
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    user_id: 3,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.put("/:user_id", jwtFilter, adminFilter, async (req, res) => {
  const { user_id } = req.params;

  const values = Array
    .of("name", "email", "password", "privilege")
    .map(item =>  ({
      key: item,
      value: req.body[item]
    }))
    .filter(item => !R.isEmpty(item.value) && !R.isNil(item.value))
    .map(item => {
      if (item.key === "password")
        item.value = bcrypt.hashSync(item.value);
      return item;
    });

  const keyEnumeration = values.map(item => `${item.key}=?`).join(', '); 
  const valueEnumeration = values.map(item => item.value);

  await query(`UPDATE users SET ${keyEnumeration} WHERE user_id = ?`, R.append(user_id, valueEnumeration));
  res
    .status(201)
    .json(R.head(await query("SELECT user_id, email, name, privilege FROM users WHERE user_id = ?", user_id)));
});

/**
 * @api {delete} /users/:user_id Delete a user
 * @apiName UserGroup
 * @apiGroup Users
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {Integer} user_id The user id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:user_id", jwtFilter, adminFilter, async (req, res) => {
  const { user_id } = req.params;

  await query("DELETE FROM users WHERE user_id = ?", user_id);
  res.status(201).json({
    success: true 
  });
});

module.exports = router;
