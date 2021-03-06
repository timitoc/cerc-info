const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");
const xlsx = require("node-xlsx").default;
const snake = require("to-snake-case");

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");
const router = express.Router();

/**
 * @api {post} /attendance/:date Add attendance
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
router.post("/:date", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  const { date } = req.params;
  const r = await query("INSERT INTO attendance (date, group_id) VALUES (?, ?)", [ date, activeGroupId ]);
  res.json({ success: true, attendanceId: r.insertId });
});

router.get("/by-user/:userId", jwtFilter, async (req, res) => {
  const { userId } = req.decodedToken;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  const userIdParameter = R.prop("userId", req.params);

  const list = await query(`
    SELECT
      attendance_id AS attendanceId,
      DATE_FORMAT(date, "%d/%m/%Y") AS date,
      (SELECT
        COUNT(1) != 0
       FROM attendance_users
       WHERE
         attendance_users.attendance_id = attendanceId
         AND
         attendance_users.user_id = ?
      ) AS isPresent
    FROM attendance
    WHERE group_id = ?
  `, [ userIdParameter, activeGroupId ]);

  const userName = R.prop("name", R.head(await query("SELECT name FROM users WHERE user_id = ?", userIdParameter)));

  res.json({
    name: userName,
    attendance: list
  });
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
 * @api {get} /attendance Get all attendances from active group
 * @apiName GetAllAtendances
 * @apiGroup Attdendance
 *
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * [{
 *    attendanceId: 3,
 *    date: "...",
 *    isPresent: true/false
 * },{
 * ...
 * }]
 */
router.get("/", jwtFilter, async (req, res) => {
  const { userId, privilege } = req.decodedToken;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

    const attendanceList = await query(`
      SELECT
        attendance_id AS attendanceId,
        DATE_FORMAT(date, "%d/%m/%Y") AS date,
        (SELECT
          COUNT(1) != 0
         FROM attendance_users
         WHERE
           attendance_users.attendance_id = attendanceId
           AND
           attendance_users.user_id = ?
        ) AS isPresent
      FROM attendance
      WHERE group_id = ?
    `, [ userId, activeGroupId ]);

    res.json(attendanceList);
});

router.get("/stats", jwtFilter, async (req, res) => {
  const { userId, privilege } = req.decodedToken;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  const dateList = await query(`
    SELECT
      DATE_FORMAT(date, "%d/%m/%Y") AS date,
      date AS originalDate
    FROM attendance
    WHERE group_id = ?
  `, Array.of(activeGroupId));

  const numberOfAttendances = R.length(dateList);

  const userList = await query(`
    SELECT 
      users.user_id AS userId,
      users.name
    FROM user_group
    JOIN users ON users.user_id = user_group.user_id
    WHERE user_group.group_id = ? AND users.privilege = 0
  `, Array.of(activeGroupId));

  const resultWithDates = await Promise.all(R.map(async (user) => {
    const { userId } = user;
    const dates = R.map(item => R.prop("date", item), await query(`
      SELECT
        DATE_FORMAT(date, "%d/%m/%Y") AS date
      FROM attendance_users
      JOIN attendance ON attendance.attendance_id = attendance_users.attendance_id
      WHERE user_id = ?
    `, Array.of(userId)));
    return R.merge(user, { dates });
  }, userList));

  const resultWithStatistics = R.map(user => {
    const numberOfLessonsAttended = R.length(user.dates);
    const stats = {
      attended: numberOfLessonsAttended,
      of: numberOfAttendances
    };
    return R.merge(user, { stats });
  }, resultWithDates);

  const sortedResult = R.reverse(R.sortBy(R.path(Array.of("stats", "attended")), resultWithStatistics));

  res.json(sortedResult);
});

router.get("/sheet", jwtFilter, async (req, res) => {
  const { attendanceId } = req.params;
  const { userId } = req.decodedToken;

  const activeGroupMappingId = R.prop("activeGroup",
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.prop("groupId",
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  const activeGroupName = R.prop("name",
    R.head(await query("SELECT name FROM groups WHERE group_id = ?", activeGroupId)));

  const userList = await query(`
    SELECT 
      users.user_id AS userId,
      users.name
    FROM user_group
    JOIN users ON users.user_id = user_group.user_id
    WHERE user_group.group_id = ? AND users.privilege = 0
  `, Array.of(activeGroupId));

  const dateList = await query(`
    SELECT
      DATE_FORMAT(date, "%d/%m/%Y") AS date,
      date AS originalDate
    FROM attendance
    WHERE group_id = ?
  `, Array.of(activeGroupId));

  const dateFormattedList = R.map(item => R.prop("date", item), dateList);

  const resultWithDates = await Promise.all(R.map(async (user) => {
    const { userId } = user;
    const dates = R.map(item => R.prop("date", item), await query(`
      SELECT
        DATE_FORMAT(date, "%d/%m/%Y") AS date
      FROM attendance_users
      JOIN attendance ON attendance.attendance_id = attendance_users.attendance_id
      WHERE user_id = ?
    `, Array.of(userId)));
    return R.merge(user, { dates });
  }, userList));

  const sheetRows = R.map(user => {
    const { dates, name } = user;

    const columns = R.map(date => {
      return R.indexOf(date, dates) != -1 ? 1 : 0;
    } , dateFormattedList);

    const rowWithName = R.prepend(name, columns);

    return rowWithName;
  }, resultWithDates);

  const sheetHeader = R.prepend("", dateFormattedList);
  const sheetData = R.prepend(sheetHeader, sheetRows);

  const buffer = xlsx.build([{name: `Prezenţă ${activeGroupName}`, data: sheetData }]);

  res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.attachment(`prezenta_${snake(activeGroupName)}.xlsx`);

  res.set("access-control-expose-headers", "filename");
  res.set("filename", `prezenta_${snake(activeGroupName)}.xlsx`);

  res.send(buffer);
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
