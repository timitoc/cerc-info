const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");
const timeAgo = require('node-time-ago-ro');

const { query } = global;
const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

router.get("/:homeworkId", async (req, res) => {

  const { homeworkId } = req.params;

  const homeworkComments = await query(`
    SELECT
      comment_id AS commentId,
      homework_id AS homeworkId,
      users.user_id AS userId,
      name,
      content,
      date
    FROM homework_comments
    JOIN users ON users.user_id = homework_comments.user_id
    WHERE homework_id = ? AND reply_to IS NULL
  `, homeworkId);

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  const homeworkCommentsWithReplies = await Promise.all(R.map( async (comment) => {
    const replies = await query(`
     SELECT
       comment_id AS commentId,
       homework_id AS homeworkId,
       users.user_id AS userId,
       name,
       content,
       date
     FROM homework_comments
     JOIN users ON users.user_id = homework_comments.user_id
     WHERE reply_to = ?
   `, R.prop("commentId", comment));

    return R.merge(comment, { replies });
  } , homeworkComments));

  const homeworkCommentsWithRepliesAndAgo = R.map(comment => {
    const agoReplies = R.map(reply => {
      return R.merge(reply, { dateAgo: timeAgo(R.prop("date", reply)).capitalize() });
    }, comment.replies);

    return R.merge(comment, { replies: agoReplies, dateAgo: timeAgo(R.prop("date", comment)).capitalize() });
  }, homeworkCommentsWithReplies);

  res.json(homeworkCommentsWithRepliesAndAgo);
});

/**
 * @api {post} /homework-comments Add comment to lesson
 * @apiName AddCommentToLesson
 * @apiGroup Comments
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "homeworkId": 7, 
 *   "content": "This is a comment :)"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * { success: true }
 */
router.post("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const { homeworkId, content } = req.body;

  await query(`
    INSERT INTO homework_comments (homework_id, content, user_id, reply_to, date)
    VALUES (?, ?, ?, NULL, ?)`, 
    Array.of(homeworkId, content, userId, new Date()));

  res.json({ success: true });
});

/**
 * @api {post} /homework-comments/reply Add reply to comment
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

  const { homeworkId } = R.head(await query("SELECT homework_id AS homeworkId FROM homework_comments WHERE comment_id = ?", commentId));

  await query(`
    INSERT INTO homework_comments (homework_id, content, user_id, reply_to, date)
    VALUES (?, ?, ?, ?, ?) `, 
    Array.of(homeworkId, content, userId, commentId, new Date()));

  res.json({ success: true });
});

/**
 * @api {put} /homework-comments/:commentId Edit comment
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
  await query("UPDATE homework_comments SET content = ? WHERE comment_id = ?", [ content, commentId ]);
  res.json({ success: true });
});

/**
 * @api {delete} /homework_comments/:commentId Delete comment
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
  await query("DELETE FROM homework_comments WHERE reply_to = ?", commentId);
  await query("DELETE FROM homework_comments WHERE comment_id = ?", commentId);
  res.json({ success: true });
});

module.exports = router;
