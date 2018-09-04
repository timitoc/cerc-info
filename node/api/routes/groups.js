//TODO: re-test everything
const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");
const privilegeFilter = require("../filters/privilege-filter.js");
const adminFilter = privilegeFilter(2);
const teacherFilter = privilegeFilter(1);

/**
 * @api {get} /groups Get all groups
 * @apiName GetGroups
 * @apiGroup Groups
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 *   [
 *     {
 *        groupId: 3,
 *        name: "Clasa a X-a",
 *        description: "Grup de pregătire pentru olimpiada de informatică"
 *     }, {
 *        groupId: 4,
 *        name: "Clasa a XII-a",
 *        description: "Grup de pregătire pentru olimpiada de informatică"
 *     }
 *   ]
 */
router.get("/", jwtFilter, teacherFilter, async (req, res) => {
  res.json(await query("SELECT name, description, group_id as groupId FROM groups"));
});

/**
 * @api {post} /groups Add a new group
 * @apiName AddGroup
 * @apiGroup Groups
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "name": "Numele grupului",
 *   "description": "Descrierea grupului",
 *   "startDate": "YYYY-MM-DD",
 *   "endDate": "YYYY-MM-DD"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    success: true
 * }
 */
router.post("/", jwtFilter, adminFilter, async (req, res) => {
  const { name, description, startDate, endDate } = req.body;

  const { insertId } = await query(`
    INSERT INTO groups (name, description, start_date, end_date)
    VALUES (?, ?, ?, ?)
  `, [ name, description, startDate, endDate ]);

  res
    .status(201)
    .json({ succes: true });
});


/**
 * @api {post} /groups/:groupId/:userId Add user to group
 * @apiName AddUserToGroup
 * @apiGroup Groups
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    success: true
 * }
 */
router.post("/:groupId/:userId", jwtFilter, async (req, res) => {
  const { groupId, userId } = req.params;
  await query("INSERT INTO user_group (user_id, group_id) VALUES (?, ?)", [ userId, groupId ]);
  res.json({ succes: true });
});

/**
 * @api {get} /groups/my Get groups for the current user
 * @apiName GetCurrentGroups
 * @apiGroup Groups
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * [{
 *    groupId: 2
 *    name: "Un grup"
 * },
 * {
 *    groupId: 3
 *    name: "Alt grup"
 * }]
 */

router.get("/my", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const groups = await query(`
    SELECT
      group_id AS groupId,
      name
    FROM group_user
    JOIN groups ON groups.group_id = group_user.group_id
    WHERE group_user.user_id = ?
  `, userId);
  res.json(groups);
});

/**
 * @api {get} /groups/:groupId Get group by id
 * @apiName GetGroupById
 * @apiGroup Groups
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} groupId The group id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *    groupData: {
 *      groupId: ...,
 *      startDate: ....,
 *      endDate: ....,
 *      name: ...,
 *      description: ...
 *    },
 *    users: ["A", "B" ]
 * }
 */
router.get("/:groupId", jwtFilter, async (req, res) => {
  const { groupId } = req.params;

  const groupObject = R.head(await query(`
    SELECT
      group_id AS groupId,
      start_date AS startDate,
      end_date AS endDate,
      name,
      description
    FROM groups
    WHERE group_id = ? AND deleted = 0
  `, groupId))

  const userList = await query(`
    SELECT name
    FROM users
    JOIN user_group ON users.user_id = user_group.user_id
    WHERE privilege = 0 AND user_group.group_id = ?
  `, groupId);

  const userNames = userList.map(item => item.name);

  res.json({
    groupData: groupObject,
    users: userNames
  });
});

/**
 * @api {put} /groups/:groupId Modify a group
 * @apiName ModifyGroup
 * @apiGroup Groups
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {Integer} groupId The group id
 *
 * @apiParamExample {json} Request example (only use the fields that you want to update):
 * {
 *   "name": "Noul nume al grupului",
 *   "description": "Noua descriere a grupului"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    groupId: 3,
 *    name: "Noul nume",
 *    description: "Noua descriere"
 * }
 */
router.put("/:groupId", jwtFilter, adminFilter, async (req, res) => {
  const { groupId } = req.params;

  const values = Array
    .of("name", "description")
    .map(item =>  ({
      key: item,
      value: req.body[item]
    }))
    .filter(item => !R.isEmpty(item.value) && !R.isNil(item.value));

  const keyEnumeration = values.map(item => `${item.key}=?`).join(', ');
  const valueEnumeration = values.map(item => item.value);

  await query(`UPDATE groups SET ${keyEnumeration} WHERE groupId = ?`, R.append(groupId, valueEnumeration));
  res
    .status(201)
    .json(R.head(await query("SELECT * FROM groups WHERE groupId = ?", groupId)));
});

/**
 * @api {delete} /groups/:groupId Delete a group
 * @apiName DeleteGroup
 * @apiGroup Groups
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {Integer} groupId The group id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:groupId", jwtFilter, adminFilter, async (req, res) => {
  const { groupId } = req.params;

  await query("UPDATE groups SET deleted = 1 WHERE group_id = ?", groupId);
  res.status(201).json({
    success: true
  });
});


module.exports = router;
