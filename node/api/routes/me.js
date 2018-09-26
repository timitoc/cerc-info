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
  const { userId, privilege } = req.decodedToken;

  if (privilege != 2) {
    const mappingId = R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)).activeGroup;

    const { activeGroupId, activeGroupName } = R.head(
      await query(`
        SELECT
          user_group.group_id AS activeGroupId,
          groups.name AS activeGroupName
        FROM user_group
        JOIN groups ON groups.group_id = user_group.group_id
        WHERE user_group_id = ?
      `, mappingId));

    return res.json(R.merge(req.decodedToken, { activeGroupId, activeGroupName }));
  }

  res.json(req.decodedToken);
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

  const userGroupRelationId = R.prop("userGroupRelationId", R.head(
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
