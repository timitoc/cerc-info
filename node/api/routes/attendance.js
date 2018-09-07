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
 *   success: true,
 *   attendanceId: 5
 * }
 */
router.post("/:groupId/:date", async (req, res) => {
  const { groupId, date } = req.params;
  const r = await query("INSERT INTO attendance (date, group_id) VALUES (?, ?)", [ date, groupId ]);
  res.json({ success: true, attendanceId: r.insertId });
});

router.get("/users/:attendanceId", async (req, res) => {
  const { attendanceId } = req.params;

  try{

    const  { groupId } = R.head(await query("SELECT group_id AS groupId FROM attendance WHERE attendance_id = ?", attendanceId));

    const users = await query(`
      SELECT
        users.user_id AS userId,
        users.name,
        (SELECT COUNT(1) != 0
          FROM attendance_users
          WHERE attendance_users.user_id = userId AND attendance_id = ?) AS isPresent
      FROM users
      JOIN user_group ON user_group.user_id = users.user_id
      WHERE group_id = ? AND users.privilege = 0
    `, [ attendanceId, groupId]);

    res.json(users);

  } catch(e) {
    return res.json({
      error: "Attendance not found!"
    })
  }

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
  const { groupId } = req.params;
  const attendanceList = await query(`
    SELECT
      attendance_id AS attendanceId,
      DATE_FORMAT(date, "%d/%m/%Y") AS date
    FROM attendance
    WHERE group_id = ?
  `, groupId);
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


/**
 * @api {get} /attendance/:attendanceId/:userId/toggle Toggle attendance for user
 * @apiName ToggleAttendance
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
router.get("/:attendanceId/:userId/toggle", async (req, res) => {
  const { attendanceId, userId } = req.params;

  const userAttendance = R.head(await query("SELECT * FROM attendance_users WHERE user_id = ? AND attendance_id = ?", [ userId, attendanceId ]));

  if (R.isNil(userAttendance)) {
    // insert it
    await query("INSERT INTO attendance_users (attendance_id, user_id) VALUES (?, ?)", [ attendanceId, userId ]);
  } else {
    // delete it
    await query("DELETE FROM attendance_users WHERE attendance_id = ? AND user_id = ?", [ attendanceId, userId ] );
  }

  res.json({ success: true });
});

module.exports = router;
