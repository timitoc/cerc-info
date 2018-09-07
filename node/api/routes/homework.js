const express = require("express");
const fileUpload = require('express-fileupload');
const randomstring = require("randomstring");
const R = require("ramda");

const router = express.Router();
router.use(fileUpload());

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");

/**
 * @api {post} /homework Add homework to your active group
 * @apiName AddHomework
 * @apiGroup Homework
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "title": "O tema",
 *   "description": "Descrierea temei",
 *   "tags": ["stack", "queue"],
 *   "tasks": [
 *     {"content": ..., "type": ...},
 *     ...
 *   ]
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true,
 *   homeworkId: 8
 * }
 */
router.post("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;
  const { description, title, tags } = req.body;

  const activeGroupMappingId = R.path(["activeGroup"],
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.path(["groupId"],
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const queryResult = await query("INSERT INTO homework (group_id, title, description, tags) VALUES (?, ?, ?, ?)",
    Array.of(activeGroupId, title, description, R.join(",", tags)));

  const { insertId } = queryResult;

  const { tasks } = req.body;

  await query("INSERT INTO tasks (homework_id, content, type) VALUES (?, ?, ?)",
    R.map(item => [insertId, R.prop("content", item), R.prop("type", item)], tasks));

  res.json({ success: true, homeworkId: insertId });
});

/**
 * @api {get} /homework Get homework from your active group
 * @apiName GetHomework
 * @apiGroup Homework
 *
 * @apiHeader {String} Authorization Bearer [jwt]

 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * [{
 *   homeworkId: 7,
 *   title: "Homework",
 *   description: "...",
 *   tags: [..]
 * }, ...]
 */
router.get("/", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

  const activeGroupMappingId = R.path(["activeGroup"],
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.path(["groupId"],
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const homeworkList = await query(`
    SELECT homework_id AS homeworkId, title, description, tags FROM homework WHERE group_id = ?`
  , activeGroupId);

  const homeworkListSplittedTags = R.map(item => R.merge(item, { tags: R.split(",", item.tags )}), homeworkList);

  res.json(homeworkListSplittedTags);
});

/**
 * @api {post} /homework/task Add task to homework
 * @apiName AddTaskToHomework
 * @apiGroup Homework
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "homeworkId": 1,
 *   "content": "...",
 *   "type": ...
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true,
 *   taskId: 8
 * }
 */
router.post("/task", jwtFilter, async (req, res) => {
  const { homeworkId, content, type } = req.body;

  const queryResult = await query("INSERT INTO tasks (homework_id, content, type) VALUES (?, ?, ?)",
    Array.of(homeworkId, content, type));

  const { insertId } = queryResult;

  res.json({ success: true, taskId: insertId });
});

/**
  * @api {delete} /homework/task/:taskId Delete task from homework
  * @apiName DeleteTaskFromHomework
  * @apiGroup Homework
  *
  * @apiHeader {String} Authorization Bearer [jwt]
*/
router.delete("/task/:taskId", jwtFilter, async (req, res) => {
  const { taskId } = req.params;

  await query("DELETE FROM tasks WHERE task_id = ?", taskId);

  res.json({ success: true });
});

/**
  * @api {get} /homework/:homeworkId Get homework (with tasks) by id
  * @apiName GetHomeworkById
  * @apiGroup Homework
  *
  * @apiHeader {String} Authorization Bearer [jwt]

  * @apiSuccessExample {json} Success response:
  * HTTP 200 OK
  * {
  *   homeworkId: ...,
  *   groupId: ...,
  *   title: ...,
  *   description: ...,
  *   tags: [...],
  *   tasks: [
  *   { taskId: ..., type: ..., content: ...}, ...
  *   ]
  * }
*/
router.get("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;

  const homework = R.head(await query(`
    SELECT homework_id AS homeworkId, group_id AS groupId, title, description, tags FROM homework WHERE homework_id = ?`
  , homeworkId));

  const taskList = await query(`
    SELECT task_id AS taskId, type, content FROM tasks WHERE homework_id = ?
  `, homeworkId);

  const response = R.merge(homework, { tasks: taskList, tags: R.split(",", homework.tags) });
  res.json(response);
});

module.exports = router;
