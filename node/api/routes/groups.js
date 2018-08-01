const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

/**
 * @api {get} /groups Get all groups
 * @apiName GetGroups
 * @apiGroup Groups
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
router.get("/", async (req, res) => {
  res.json(await query("SELECT * FROM groups"));
});

/**
 * @api {post} /groups Add a new group
 * @apiName AddGroup
 * @apiGroup Groups
 *
 * @apiParamExample {json} Request example:
 * {
 *   "name": "Numele grupului",
 *   "description": "Descrierea grupului"
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    groupId: 3,
 *    name: "Grupul nou creat",
 *    description: "Descrierea grupului nou creat" 
 * }
 */
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  const { insertId } = await query("INSERT INTO groups (name, description) VALUES (?, ?)", [ name, description ]);
  res
    .status(201)
    .json(R.head(await query("SELECT * FROM groups WHERE groupId = ?", insertId)));
});

/**
 * @api {get} /groups/:groupId Get group by id
 * @apiName GetGroupById
 * @apiGroup Groups
 *
 * @apiParam {String} groupId The group id
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *    groupId: 3,
 *    name: "Un group",
 *    description: "Descrierea grupului" 
 * }
 */
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.params;
  res.json(R.head(await query("SELECT * FROM groups WHERE groupId = ?", groupId)));
});

/**
 * @api {put} /groups/:groupId Modify a group
 * @apiName ModifyGroup
 * @apiGroup Groups
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
router.put("/:groupId", async (req, res) => {
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
 * @apiParam {Integer} groupId The group id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:groupId", async (req, res) => {
  const { groupId } = req.params;

  await query("DELETE FROM groups WHERE groupId = ?", groupId);
  res.status(201).json({
    success: true 
  });
});

module.exports = router;
