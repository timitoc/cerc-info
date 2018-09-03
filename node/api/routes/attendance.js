const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");

const { query } = global;

const router = express.Router();

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

// get users
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

module.exports = router;
