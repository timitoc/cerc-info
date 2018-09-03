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
 *   activeGroupId: 1,
 *   userId: 3
 * }
 */

router.get("/", jwtFilter, async (req, res) => {
  console.log("req.decodedToken", req.decodedToken);
  const { userId } = req.decodedToken;
  console.log("userId", userId);
  /*const groups = await query("SELECT group_id FROM group_user WHERE user_id = ? AND active = 1 LIMIT 1", userId);
  const group = groups.length && groups[0];
  if (group) {
    res.json(R.assoc("groupId", group.group_id, req.decodedToken));
  } else {
    res.json(req.decodedToken);
  }*/

  const activeGroupId = R.prop(R.head(await query("SELECT active_group FROM users WHERE user_id = ?", userId)), "active_group");

  const result = R.merge(req.decodedToken, { activeGroupId });

  res.json(result);
});


/**
 * @api {post} /me/active-group Change user's active group
 * @apiName Me
 * @apiGroup Me
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "groupId": 7
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.post("/active-group", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const { groupId } = req.body;

  const userGroupRelationId = R.head(await query("SELECT user_group_id FROM user_group WHERE user_id = ? AND group_id = ?", [ userId, groupId ]));

  if (R.isNil(userGroupRelationId)) {
    return res.json({
      error: "No user-group mapping found!"
    })
  }

  // Modify user's active group
  await query("UPDATE users SET active_group = ? WHERE user_id = ?", [ userGroupRelationId, userId ]);

  res.json({
    success: true
  })
});

module.exports = router;
