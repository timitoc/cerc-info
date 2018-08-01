const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const R = require("ramda");

const { query } = global;

const router = express.Router();

/**
 * @api {get} /users Get all users
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 *   [
 *     {
 *        userId: 1,
 *        name: "Johnny Smith",
 *        email: "johnny_smith@gmail.com",
 *        privilege: 0
 *     },
 *     {
 *        userId: 2,
 *        name: "John Smith",
 *        email: "john_smith@gmail.com",
 *        privilege: 1
 *     }
 *   ]
 */
router.get("/", async (req, res) => {
  res.json(await query("SELECT userId, email, name, privilege FROM users"));
});

/**
 * @api {get} /users/:userId Get user by id
 * @apiName GetUsersById
 * @apiGroup Users
 *
 * @apiParam {String} userId The user id
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *    userId: 2,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  res.json(R.head(await query("SELECT userId, email, name, privilege FROM users WHERE userId = ?", userId)));
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
  const { email, password, privilege, name } = req.body;
  const hashedPassword = bcrypt.hashSync(password);

  const { insertId } = await query("INSERT INTO users (email, password, privilege, name) VALUES (?, ?, ?, ?)",
    [ email, hashedPassword, privilege, name ]);

  res
    .status(201)
    .json(R.head(await query("SELECT userId, email, name, privilege FROM users WHERE userId = ?", insertId)));
});

/**
 * @api {put} /users/:userId Modify a user
 * @apiName ModifyUser
 * @apiGroup Users
 *
 * @apiParam {Integer} userId The user id
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
 *    userId: 3,
 *    name: "John Smith",
 *    email: "john_smith@gmail.com",
 *    privilege: 1
 * }
 */
router.put("/:userId", async (req, res) => {
  const { userId } = req.params;

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

  await query(`UPDATE users SET ${keyEnumeration} WHERE userId = ?`, R.append(userId, valueEnumeration));
  res
    .status(201)
    .json(R.head(await query("SELECT userId, email, name, privilege FROM users WHERE userId = ?", userId)));
});

/**
 * @api {delete} /users/:userId Delete a user
 * @apiName UserGroup
 * @apiGroup Users
 *
 * @apiParam {Integer} userId The user id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  await query("DELETE FROM users WHERE userId = ?", userId);
  res.status(201).json({
    success: true 
  });
});

module.exports = router;
