//TODO: re-test everything
const express = require("express");
const R = require("ramda");
const snake = require('to-snake-case');

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
 *        "title": "Lectia 1",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": [..]
 *    },
 *    {
 *        "lessonId": 3,
 *        "title": "Lectia 2",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": [..]
 *    }
 * ]
 */
router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const lessonList = await query("SELECT lesson_id AS lessonId, title, author_id AS authorId, content, tags FROM lessons");
  const lessonListSplittedTags = R.map(item => R.merge(item, { tags: R.split(",", item.tags )}), lessonList);

  res.json(lessonListSplittedTags);
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
 *   "tt": "Lectia 1",
 *   "content": "Continutul lectiei",
 *   "authorId": 2
 *   "tags": [..]
 * }
 */
router.get("/:lessonId", async (req, res) => {
  const { lessonId } = req.params;
  const lesson = R.head(await query(`
    SELECT lesson_id AS lessonId, title, author_id AS authorId, content, tags FROM lessons WHERE lesson_id = ?
  `, lessonId));
  const lessonSplittedTags = R.merge(lesson, { tags: R.split(",", lesson.tags )});
  res.json(lessonSplittedTags);
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
 *  	"title": "Ciclu hamiltonian de cost minim",
 *  	"content": "Continutul lectiei",
 *  	"authorId": 2,
 *    "tags": ["tag", "tag"]
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "success": true,
 *    "lessonId": 3
 * }
 */
router.post("/", async (req, res) => {
  const { title, content, authorId, tags } = req.body;
  console.log({ title, content, authorId, tags  });
  const { insertId } = await query("INSERT INTO lessons (title, content, author_id, tags) VALUES (?, ?, ?, ?)",
    [ title, content, authorId, R.join(",", tags) ]);

  res
    .status(201)
    .json({ success: true, lessonId: insertId });
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
 *   "title": "Noul nume al lecţiei",
 *   "content": "Noul conţinut",
 *   "tags": ["..."]
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "success": true
 *  }
 */
router.put("/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;

  const values = Array
    .of("title", "content", "authorId" )
    .map(item =>  ({
      key: item,
      value: req.body[item]
    }))
    .filter(item => !R.isEmpty(item.value) && !R.isNil(item.value));

  const valuesJoinedTags = R.ifElse(
    R.has("tags"),
    R.merge(values, { tags: R.join(",", values.tags )}),
    values
  );

  const keyEnumeration = valuesJoinedTags.map(item => `${snake(item.key)}=?`).join(', ');
  const valueEnumeration = valuesJoinedTags.map(item => item.value);

  await query(`UPDATE lessons SET ${keyEnumeration} WHERE lesson_id = ?`, R.append(lessonId, valueEnumeration));
  res
    .status(201)
    .json({ success: true });
});

/**
 * @api {delete} /lessons/:lessonId Delete a lesson
 * @apiName DeleteLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]

 * @apiParam {String} lessonId The lesson id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;

  await query("DELETE FROM lessons WHERE lesson_id = ?", lessonId);
  res.status(201).json({
    success: true
  });
});


module.exports = router;
