const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

/**
 * @api {get} /recommended-lessons Get the recommended lessons for your active group
 * @apiName Recommended
 * @apiGroup Recommended
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 */
router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

  const activeGroupId = R.prop(R.head(await query("SELECT active_group FROM users WHERE user_id = ?", userId)), "active_group");

  const lessons = await query(`
    SELECT lesson_id FROM recommended_lessons
    JOIN lessons ON lessons.lesson_id = recommended_lessons.lesson_id
    WHERE recommended_lessons.group_id = ?
  `, [ activeGroupId ]);

  res.json(lessons);
});

/**
 * @api {post} /recommended_lessons Add a recommended lesson to your active group
 * @apiName Recommended
 * @apiGroup Recommended
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "lessonId": 7
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.post("/", jwtFilter, async (req, res) => {
  const activeGroupId = R.prop(R.head(await query("SELECT active_group FROM users WHERE user_id = ?", userId)), "active_group");
  const { lessonId } = req.body;

  await query("INSERT INTO recommended_lessons (lesson_id, group_id) VALUES (?, ?)", [ lessonId, activeGroupId ]);

  res.json({
    success: true
  })
});

/**
 * @api {delete} /recommended_lessons/:lessonId Remove a recommended lesson from your active group
 * @apiName Recommended
 * @apiGroup Recommended
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} lessonId The lesson id

 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.delete("/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;
  const activeGroupId = R.prop(R.head(await query("SELECT active_group FROM users WHERE user_id = ?", userId)), "active_group");

  await query("DELETE FROM recommended_lessons WHERE group_id = ? AND lesson_id = ?", [ activeGroupId, lessonId ]);

  res.json({
    success: true
  })
});

module.exports = router;
