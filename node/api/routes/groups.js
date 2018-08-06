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
router.get("/", jwtFilter, adminFilter, async (req, res) => {
  res.json(await query("SELECT * FROM groups"));
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
router.post("/", jwtFilter, adminFilter, async (req, res) => {
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
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
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
router.get("/:groupId", jwtFilter, async (req, res) => {
  const { groupId } = req.params;
  res.json(R.head(await query("SELECT * FROM groups WHERE groupId = ?", groupId)));
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

  await query("DELETE FROM groups WHERE groupId = ?", groupId);
  res.status(201).json({
    success: true 
  });
});

/**
 * @api {get} /groups/:groupId/lessons Get all lessons from a group
 * @apiName GetLessons
 * @apiGroup Lessons
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * [
 *    {
 *        "lessonId": 2,
 *        "groupId": 2,
 *        "name": "Lectia 1",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": "dynammic programming",
 *        "dateAdded": "2018-07-31T21:00:00.000Z"
 *    },
 *    {
 *        "lessonId": 3,
 *        "groupId": 2,
 *        "name": "Lectia 2",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": "math,modular arithmetic",
 *        "dateAdded": "2018-07-31T21:00:00.000Z"
 *    }
 * ]
 */
router.get("/:groupId/lessons", /*jwtFilter,*/ async (req, res) => {
  const { groupId } = req.params;
  const { tags } = req.query;
  if (R.isNil(tags) || R.isEmpty(tags)) {
    return res.json(await query("SELECT * FROM lessons WHERE groupId = ?", groupId));
  }
  const splittedTags = tags.split(",");
  const sql = `SELECT * FROM lessons WHERE groupId = ? AND (${splittedTags.map(item => "tags REGEXP ',*"+item+".*'").join(" OR ")})`;
  res.send(sql);
});

/**
 * @api {get} /groups/:groupId/lessons/:lessonId Get lesson by id
 * @apiName GetLessonById
 * @apiGroup Lessons
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} groupId The group id (useless, kept only for symmetrical purposes)
 * @apiParam {String} lessonId The lesson id
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   "lessonId": 2,
 *   "groupId": 2,
 *   "name": "Lectia 1",
 *   "content": "Continutul lectiei",
 *   "authorId": 2,
 *   "tags": "dynammic programming,graph theory",
 *   "dateAdded": "2018-07-31T21:00:00.000Z"
 * }
 */
router.get("/:groupId/lessons/:lessonId", jwtFilter, async (req, res) => {
  const { groupId, lessonId } = req.params;
  res.json(R.head(await query("SELECT * FROM lessons WHERE lessonId = ?", lessonId)));
});

/**
 * @api {post} /groups/:groupId/lessons Add a new lesson
 * @apiName AddLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *  	"name": "Ciclu hamiltonian de cost minim",
 *  	"content": "Continutul lectiei",
 *  	"authorId": 2,
 *  	"tags": "dynammic programming,graph theory"
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "lessonId": 3,
 *    "groupId": 2,
 *    "name": "Ciclu hamiltonian de cost minim"",
 *    "content": "Continutul lectiei",
 *    "authorId": 2,
 *    "tags": "dynammic programming,graph theory",
 *    "dateAdded": "2018-07-31T21:00:00.000Z"
 * }
 */
router.post("/:groupId/lessons", jwtFilter, teacherFilter, async (req, res) => {
  const { groupId } = req.params;
  const { name, content, authorId, tags } = req.body;
  const { insertId } = await query("INSERT INTO lessons (groupId, name, content, authorId, tags, dateAdded) VALUES (?, ?, ?, ?, ?, ?)",
    [ groupId, name, content, authorId, tags, new Date() ]);

  res
    .status(201)
    .json(R.head(await query("SELECT * FROM lessons WHERE lessonId = ?", insertId)));
});

/**
 * @api {put} /groups/:groupId/lessons/:lessonId Modify a lesson
 * @apiName ModifyLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} groupId The group id (useless, kept only for symmetrical purposes)
 * @apiParam {String} lessonId The lesson id
 *
 * @apiParamExample {json} Request example (only use the fields that you want to update):
 * {
 *   "name": "Noul nume al lecţiei",
 *   "content": "Noul conţinut"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "lessonId": 3,
 *    "groupId": 2,
 *    "name": "Noul nume"",
 *    "content": "Noul conţinut",
 *    "authorId": 2,
 *    "tags": "dynammic programming,graph theory",
 *    "dateAdded": "2018-07-31T21:00:00.000Z"
 *  }
 */
router.put("/:groupId/lessons/:lessonId", jwtFilter, teacherFilter, async (req, res) => {
  const { groupId, lessonId } = req.params;

  const values = Array
    .of("name", "content", "tags", "authorId", "groupId")
    .map(item =>  ({
      key: item,
      value: req.body[item]
    }))
    .filter(item => !R.isEmpty(item.value) && !R.isNil(item.value));

  const keyEnumeration = values.map(item => `${item.key}=?`).join(', '); 
  const valueEnumeration = values.map(item => item.value);

  await query(`UPDATE lessons SET ${keyEnumeration} WHERE lessonId = ?`, R.append(lessonId, valueEnumeration));
  res
    .status(201)
    .json(R.head(await query("SELECT * FROM lessons WHERE lessonId = ?", lessonId)));
});

/**
 * @api {delete} /groups/:groupId/lessons/:lessonId Delete a lesson
 * @apiName DeleteLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} groupId The group id (useless, kept only for symmetrical purposes)
 * @apiParam {String} lessonId The lesson id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:groupId/lessons/:lessonId", jwtFilter, teacherFilter, async (req, res) => {
  const { groupId, lessonId } = req.params;

  await query("DELETE FROM lessons WHERE lessonId = ?", lessonId);
  res.status(201).json({
    success: true 
  });
});

module.exports = router;
