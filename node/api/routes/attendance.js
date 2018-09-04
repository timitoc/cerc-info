const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const router = express.Router();

/**
 * @api {post} /attendance/:groupId/:date Add attendance
 * @apiName AddAttendance
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.post("/:groupId/:date", async (req, res) => {
  const { groupId, date } = req.params;
  await query("INSERT INTO attendance (date, group_id) VALUES (?, ?)", [ date, groupId ]);
});

/**
 * @api {post} /attendance/:groupId/:date/:userId Add user to attendance
 * @apiName AddUser
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.post("/:groupId/:date/:userId", async (req, res) => {
  const { groupId, date, userId } = req.params;

  const existingAttendance = R.head(await query(`
    SELECT
      attendance_id AS attendanceId,
      date,
      group_id AS groupId
    FROM attendance
    WHERE date = ? AND group_id = ?
  `, [ date, groupId ]));

  if (R.isNil(existingAttendance)) {
    await query("INSERT INTO attendance (date, group_id) VALUES (?, ?)", [ date, groupId ]);
  }

  const attendanceObject = R.ifElse(
    R.isNil(existingAttendance),
    R.head(await query(`
     SELECT
       attendance_id AS attendanceId,
       date,
       group_id AS groupId
     FROM attendance
     WHERE date = ? AND group_id = ?
   `, [ date, groupId ])),
   existingAttendance);

   const { attendanceId } = attendanceObject;

   try {
     await query("INSERT INTO attendance_users (attendance_id, user_id) VALUES (?, ?)", [ attendanceId, userId ]);

     res.json({
       success: true
     });
   } catch ( error ) {
     res.json({
       success: false,
       error
     });
   }
});

/**
 * @api {get} /attendance/:groupId/:date Get users from attendance
 * @apiName GetUsers
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.get("/:groupId/:date", async (req, res) => {
  const { groupId } = req.params;

  const attendanceList = await query(`
  SELECT
    attendance_id AS attendanceId,
    date,
    group_id AS groupId
  FROM attendance
  WHERE group_id = ?
  `, groupId);

  res.json(attendanceList);
});

/**
 * @api {get} /attendance/:groupId Get all attendances from group
 * @apiName GetAllAtendances
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * [{
 *    attendanceId: 3,
 *    date: "..."
 * },{
 * ...
 * }]
 */
router.get("/:groupId", async (req, res) => {
  const { groupId } = req.body;
  const attendanceList = await query("SELECT attendance_id AS attendanceId, date FROM attendance WHERE group_id = ?", groupId);
  res.json(attendanceList);
});

/**
 * @api {delete} /attendance/:groupId/:date/:userId Remove user from attendance
 * @apiName RemoveUser
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   success: true
 * }
 */
router.delete("/:groupId/:date/:userId", async (req, res) => {
  const { groupId, date, userId } = req.params;

  const attendanceObject = R.head(await query(`
    SELECT
      attendance_id AS attendanceId,
      date,
      group_id AS groupId
    FROM attendance
    WHERE date = ? AND group_id = ?
  `, [ date, groupId ]));

  if (R.isNil(attendanceObject)) {
    return res.json({
      error: "Attendance does not exist!"
    })
  }

  const { attendanceId } = attendanceObject;

  await query("DELETE FROM attendance_users WHERE attendance_id = ? AND user_id = ?", [ attendanceId, userId ] );

  res.json({ success: true });
});

module.exports = router;
