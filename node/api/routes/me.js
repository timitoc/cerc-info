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


  let result = req.decodedToken;
  const mappingId = R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)).activeGroup;

  const activeGroupId = R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", mappingId)).groupId;

  result.activeGroupId = activeGroupId;

  res.json(result);
});


/**
 * @api {post} /me/active-group Change user's active group
 * @apiName SetActiveGroup
 * @apiGroup ActiveGroup
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
  const { userId, privilege } = req.decodedToken;
  const { groupId } = req.body;

  const userGroupRelationId = R.path(["userGroupRelationId"], R.head(
    await query("SELECT user_group_id AS userGroupRelationId FROM user_group WHERE user_id = ? AND group_id = ?", [ userId, groupId ])));


  if (privilege == 0) {

    if (R.isNil(userGroupRelationId)) {
      return res.status(500).json({ error: "No user-group mapping found!" });
    }

    // Modify user's active group
    await query("UPDATE users SET active_group = ? WHERE user_id = ?", [ userGroupRelationId, userId ]);

    res.json({ success: true });
  } else {

    if (R.isNil(userGroupRelationId)) {
      // Insert user-group mapping
       const { insertId } = await query("INSERT INTO user_group (user_id, group_id) VALUES (?, ?)", [ userId, groupId ]);
       console.log("insertId", insertId);
       // Set active group
       await query("UPDATE users SET active_group = ? WHERE user_id = ?", [ insertId , userId ]);
    } else {
       await query("UPDATE users SET active_group = ? WHERE user_id = ?", [ userGroupRelationId, userId ]);
    }

    res.json({ success: true });
  }
});

module.exports = router;
