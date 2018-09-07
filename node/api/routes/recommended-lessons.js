const express = require("express");
const R = require("ramda");

const router = express.Router();

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

/**
 * @api {get} /recommended-lessons Get the recommended lessons for your active group
 * @apiName GetRecommended
 * @apiGroup Recommended
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 */
router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

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


  res.json(await query(`
    SELECT
      lessons.lesson_id AS lessonId,
      title,
      (SELECT COUNT(1) != 0 FROM recommended_lessons WHERE recommended_lessons.lesson_id = lessonId AND recommended_lessons.group_id = ?) AS isRecommended
    FROM lessons
  `, activeGroupId));
});

/**
 * @api {post} /recommended_lessons Add a recommended lesson to your active group
 * @apiName AddRecommended
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
 * @apiName DeleteRecommended
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

/**
 * @api {get} /recommended_lessons/:lessonId/toggle Toggle recommended lesson
 * @apiName ToggleRecommended
 * @apiGroup Recommended
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */

router.get("/:lessonId/toggle", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

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

  const { lessonId } = req.params;

  const lesson = R.head(await query("SELECT * FROM recommended_lessons WHERE group_id = ? AND lesson_id = ?",
    [activeGroupId, lessonId]));

  if (R.isNil(lesson)) {

    await query("INSERT INTO recommended_lessons (lesson_id, group_id) VALUES (?, ?)", [ lessonId, activeGroupId ]);
  } else {
    await query("DELETE FROM recommended_lessons WHERE group_id = ? AND lesson_id = ?", [ activeGroupId, lessonId ]);
  }

  res.json({
    success: true
  })
});

module.exports = router;
