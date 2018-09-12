const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;
const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

/**
 * @api {post} /lesson-comments Add comment to lesson
 * @apiName AddCommentToLesson
 * @apiGroup Comments
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "lessonId": 7, 
 *   "content": "This is a comment :)"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * { success: true }
 */
router.post("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const { lessonId, content } = req.body;

  await query(`
    INSERT INTO lesson_comments (lesson_id, content, user_id, reply_to, date)
    VALUES (?, ?, ?, NULL, ?)`, 
    Array.of(lessonId, content, userId, new Date()));

  res.json({ success: true });
});

/**
 * @api {post} /lesson-comments/reply Add reply to comment
 * @apiName AddReplyToComment
 * @apiGroup Comments
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "commentId": 7, 
 *   "content": "This is a reply :)"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * { success: true }
 */
router.post("/reply", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const { commentId, content } = req.body;

  console.log("commentId", commentId);

  const { lessonId } = R.head(await query("SELECT lesson_id AS lessonId FROM lesson_comments WHERE comment_id = ?", commentId));

  await query(`
    INSERT INTO lesson_comments (lesson_id, content, user_id, reply_to, date)
    VALUES (?, ?, ?, ?, ?) `, 
    Array.of(lessonId, content, userId, commentId, new Date()));

  res.json({ success: true });
});

/**
 * @api {put} /lesson-comments/:commentId Edit comment
 * @apiName EditComment
 * @apiGroup Comments
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "content": "This is an edited comment"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.put("/:commentId", jwtFilter, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  await query("UPDATE  SET content = ? WHERE comment_id = ?", [ content, commentId ]);
  res.json({ success: true });
});

/**
 * @api {delete} /lesson-comments/:commentId Delete comment
 * @apiName DeleteComment
 * @apiGroup Comments
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.delete("/:commentId", jwtFilter, async (req, res) => {
  const { commentId } = req.params;
  await query("DELETE FROM lesson_comments WHERE reply_to = ?", commentId);
  await query("DELETE FROM lesson_comments WHERE comment_id = ?", commentId);
  res.json({ success: true });
});

module.exports = router;
