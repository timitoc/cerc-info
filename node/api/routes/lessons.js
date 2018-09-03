//TODO: re-test everything
const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

/**
 * @api {get} /lessons Get all lessons
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
 *        "name": "Lectia 1",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": "dynammic programming",
 *        "dateAdded": "2018-07-31T21:00:00.000Z"
 *    },
 *    {
 *        "lessonId": 3,
 *        "name": "Lectia 2",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": "math,modular arithmetic",
 *        "dateAdded": "2018-07-31T21:00:00.000Z"
 *    }
 * ]
 */
router.get("/", async (req, res) => {
  res.json(await query("SELECT * FROM lessons"));
});

/**
 * @api {get} /lessons/:lessonId Get lesson by id
 * @apiName GetLessonById
 * @apiGroup Lessons
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} lessonId The lesson id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   "lessonId": 2,
 *   "name": "Lectia 1",
 *   "content": "Continutul lectiei",
 *   "authorId": 2,
 *   "tags": "dynammic programming,graph theory",
 *   "dateAdded": "2018-07-31T21:00:00.000Z"
 * }
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  res.json(R.head(await query("SELECT * FROM lessons WHERE lesson_id = ?", lessonId)));
});

/**
 * @api {post} /lessons Add a new lesson
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
 *    "name": "Ciclu hamiltonian de cost minim"",
 *    "content": "Continutul lectiei",
 *    "authorId": 2,
 *    "tags": "dynammic programming,graph theory",
 *    "dateAdded": "2018-07-31T21:00:00.000Z"
 * }
 */
router.post("/", async (req, res) => {
  const { name, content, authorId, tags } = req.body;
  const { insertId } = await query("INSERT INTO lessons (name, content, authorId, tags, dateAdded) VALUES (?, ?, ?, ?, ?)",
    [ name, content, authorId, tags, new Date() ]);

  res
    .status(201)
    .json(R.head(await query("SELECT * FROM lessons WHERE lesson_id = ?", insertId)));
});

/**
 * @api {put} /lessons/:lessonId Modify a lesson
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
 *    "name": "Noul nume"",
 *    "content": "Noul conţinut",
 *    "authorId": 2,
 *    "tags": "dynammic programming,graph theory",
 *    "dateAdded": "2018-07-31T21:00:00.000Z"
 *  }
 */
router.put("/:lessonId", jwtFilter, async (req, res) => {
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
 * @api {delete} /lessons/:lessonId Delete a lesson
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
router.delete("/:groupId/lessons/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;

  await query("UPDATE lessons SET deleted = 1 WHERE lessonId = ?", lessonId);
  res.status(201).json({
    success: true
  });
});


module.exports = router;
