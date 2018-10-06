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

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const queryResult = await query("INSERT INTO homework (group_id, title, description, tags) VALUES (?, ?, ?, ?)",
    Array.of(activeGroupId, title, description, R.join(",", tags)));

  const { insertId } = queryResult;

  const { tasks } = req.body;

  await query("INSERT INTO tasks (homework_id, content, type) VALUES ?",
    [R.map(item => [insertId, R.prop("content", item), R.prop("type", item)], tasks)]);

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

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const homeworkList = await query(`
    SELECT homework_id AS homeworkId, title, description, tags FROM homework WHERE group_id = ?`
  , activeGroupId);

  const homeworkListSplittedTags = R.map(item => R.merge(item, { tags: R.split(",", item.tags )}), homeworkList);

  const homeworkListWithStatus = await Promise.all(R.map(async (homework) => {

    const { homeworkId } = homework;

    const taskList = await query(`
      SELECT task_id AS taskId, type, content FROM tasks WHERE homework_id = ?
    `, homeworkId);

    const submit = R.head(await query(`
      SELECT submit_id AS submitId FROM submit WHERE homework_id = ? AND user_id = ?
    `, [ homeworkId, userId ]));

    if (R.isNil(submit)) {
      return R.merge(homework, { status: "Netrimis" });
    }
    const { submitId } = submit;

    const submittedTasks = await query(`
    SELECT task_id AS taskId FROM submit_task WHERE submit_id = ?
  `, submitId);

    const submittedTaskIds = R.map(item => R.prop("taskId", item), submittedTasks);
    const taskIds = R.map(item => R.prop("taskId", item), taskList);

    const unsubmittedTaskIds = R.difference(taskIds, submittedTaskIds);

    console.log(taskIds)
    console.log(submittedTaskIds)
    console.log(unsubmittedTaskIds)

    if (unsubmittedTaskIds.length == taskIds.length) {
      return R.merge(homework, { status: "Netrimis" });
    }

    if (R.isEmpty(unsubmittedTaskIds)) {
      return R.merge(homework, { status: "Complet" });
    } else {
      return R.merge(homework, { status: "Parţial" });
    }

  }, homeworkListSplittedTags));

  console.log(homeworkListWithStatus);

  res.json(homeworkListWithStatus);
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
  const { userId } = req.decodedToken;

  const homework = R.head(await query(`
    SELECT homework_id AS homeworkId, group_id AS groupId, title, description, tags FROM homework WHERE homework_id = ?`
  , homeworkId));

  const taskList = await query(`
    SELECT task_id AS taskId, type, content FROM tasks WHERE homework_id = ?
  `, homeworkId);

  const submit = R.head(await query(`
    SELECT submit_id AS submitId FROM submit WHERE homework_id = ? AND user_id = ?
  `, [ homeworkId, userId ]));

  if (R.isNil(submit)) {
    const response = R.merge(homework, { tasks: taskList, tags: R.split(",", homework.tags), status: "Netrimis" });
    return res.json(response);
  }
  const { submitId } = submit;

  const submittedTasks = await query(`
    SELECT task_id AS taskId FROM submit_task WHERE submit_id = ?
  `, submitId);

  const submittedTaskIds = R.map(item => R.prop("taskId", item), submittedTasks);
  const taskIds = R.map(item => R.prop("taskId", item), taskList);

  const unsubmittedTaskIds = R.difference(taskIds, submittedTaskIds);
    console.log(taskIds)
    console.log(submittedTaskIds)
    console.log(unsubmittedTaskIds)

  if (unsubmittedTaskIds.length == taskIds.length) {
    const response = R.merge(homework, { tasks: taskList, tags: R.split(",", homework.tags), status: "Netrimis" });
    return res.json(response);
  }

  if (R.isEmpty(unsubmittedTaskIds)) {
    const response = R.merge(homework, { tasks: taskList, tags: R.split(",", homework.tags), status: "Complet" });
    res.json(response);
  } else {
    const response = R.merge(homework, { tasks: taskList, tags: R.split(",", homework.tags), status: "Parţial" });
    res.json(response);
  }
  

});

/**
  * @api {delete} /homework/:homeworkId Delete homework by id
  * @apiName DeleteHomeworkById
  * @apiGroup Homework
  *
  * @apiHeader {String} Authorization Bearer [jwt]

  * @apiSuccessExample {json} Success response:
  * HTTP 200 OK
  * { success: true }
*/
router.delete("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;

  await query("DELETE FROM tasks WHERE homework_id = ?", homeworkId);
  await query("DELETE FROM homework WHERE homework_id = ?", homeworkId);

  res.json({ success: true });
});

/**
  * @api {put} /homework/:homeworkId Modify homework
  * @apiName ChangeHomeworkById
  * @apiGroup Homework
  *
  * @apiHeader {String} Authorization Bearer [jwt]
  *
  * @apiParamExample {json} Request example:
  * Same as POST
  * HTTP 200 OK
  * { success: true }
*/
router.put("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;

  await query("DELETE FROM tasks WHERE homework_id = ?", homeworkId);
  await query("DELETE FROM homework WHERE homework_id = ?", homeworkId);

  const { userId } = req.decodedToken;
  const { description, title, tags } = req.body;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const queryResult = await query(`
    INSERT INTO homework
      (homework_id, group_id, title, description, tags)
    VALUES (?, ?, ?, ?, ?)`,

    Array.of(
      homeworkId,
      activeGroupId,
      title,
      description,
      R.join(",", tags)));

  const { insertId } = queryResult;

  const { tasks } = req.body;

  await query("INSERT INTO tasks (homework_id, content, type) VALUES ?",
    [R.map(item => [insertId, R.prop("content", item), R.prop("type", item)], tasks)]);

  res.json({ success: true });
});

module.exports = router;
