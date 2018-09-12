const express = require("express");
const R = require("ramda");
const snake = require('to-snake-case');
const fs = require("fs");
const path = require("path");
const randomstring = require("randomstring");
const mysql = require("mysql");
const sha1 = require('node-sha1');

const timeAgo = require('node-time-ago-ro');

const fileUpload = require('express-fileupload');
const serveIndex = require('serve-index');

const { query } = global;
const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

router.use(fileUpload());
//router.use('/list', express.static('/'), serveIndex('/', {'icons': true}))

router.get("/download/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const uploadObject = R.head(await query(
    "SELECT original_filename AS originalName, mime_type AS mimeType FROM lesson_uploads WHERE filename = ?", fileName));

  if (R.isNil(uploadObject)) {
    return res.status(404);
  }

  const { originalName, mimeType } = uploadObject;

  res.attachment(originalName);
  res.type(mimeType);

  const fileContent = fs.readFileSync(`/usr/src/uploads/${fileName}`);
  res.send(fileContent);
});

/**
 * @api {get} /lessons Get all lessons
 * @apiName GetLessons
 * @apiGroup Lessons
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * [
 *    {
 *        "lessonId": 2,
 *        "title": "Lectia 1",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": [..]
 *    },
 *    {
 *        "lessonId": 3,
 *        "title": "Lectia 2",
 *        "content": "Continutul lectiei",
 *        "authorId": 2,
 *        "tags": [..],
 *        "authorName": "...",
 *        "isRecommended": false
 *    }
 * ]
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

  const lessonList = await query(`
    SELECT
      lesson_id AS lessonId,
      title,
      author_id AS authorId,
      content,
      tags,
      users.name AS authorName,
      (
        SELECT
          COUNT(1) != 0
        FROM recommended_lessons
        WHERE recommended_lessons.lesson_id = lessonId AND recommended_lessons.group_id = ?
      ) AS isRecommended
    FROM lessons
    JOIN users ON users.user_id = lessons.author_id
  `, [activeGroupId]);

  const lessonListSplittedTags = R.map(item => R.merge(item, { tags: R.split(",", item.tags )}), lessonList);

  res.json(lessonListSplittedTags);
});

/**
 * @api {get} /lessons/:lessonId Get lesson by id
 * @apiName GetLessonById
 * @apiGroup Lessons
 *
 * @apiPermission anyone
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} lessonId The lesson id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *   "lessonId": 2,
 *   "title": "Lectia 2",
 *   "content": "Continutul lectiei",
 *   "authorId": 2,
 *   "authorName": "John Smith"
 *   "tags": [..],
 *   "comments": [{
 *     "name": ...,
 *     "userId": ...,
 *     "commentId": ...,
 *     "content": ...,
 *     "replies": [
 *       // same structure as comment
 *     ]
 *   }, ...],
 *   "isRecommended": false
 * }
 */
router.get("/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;
  const { userId } = req.decodedToken;

  const activeGroupMappingId = R.path(["activeGroup"],
    R.head(await query("SELECT active_group AS activeGroup FROM users WHERE user_id = ?", userId)));

  const activeGroupId = R.path(["groupId"],
    R.head(await query("SELECT group_id AS groupId FROM user_group WHERE user_group_id = ?", activeGroupMappingId)));

  if (R.isNil(activeGroupId)) {
    return res.status(500).json({ error: "Active group not found !" });
  }

  const lesson = R.head(await query(`
    SELECT
      lesson_id AS lessonId,
      title,
      author_id AS authorId,
      content,
      tags,
      users.name AS authorName,
      (
        SELECT
          COUNT(1) != 0
        FROM recommended_lessons
        WHERE recommended_lessons.lesson_id = lessonId AND recommended_lessons.group_id = ?
      ) AS isRecommended
    FROM lessons
    JOIN users ON users.user_id = lessons.author_id
    WHERE lesson_id = ?
  `, [activeGroupId, lessonId]));

  const lessonSplittedTags = R.merge(lesson, { tags: R.split(",", lesson.tags )});

  const lessonUploads = await query(`
    SELECT
      original_filename AS filename, CONCAT("/lessons/download/",filename) AS url
    FROM lesson_uploads
    WHERE lesson_id = ?
  `, [lessonId]);

  //const lessonComments = R.map(async comment => {
  //  const { commentId } = comment;
  //  const replies = R.map(async reply => {
  //    return R.merge(reply, { dateAgo: timeAgo(reply.date) }); 
  //  },
  //  await(`
  //    SELECT
  //      comment_id AS commentId,
  //      lesson_id AS lessonId,
  //      users.user_id AS userId,
  //      name,
  //      content,
  //      date
  //    JOIN users ON users.user_id = lesson_comments.user_id
  //    WHERE lesson_id = ? AND reply_to = ?
  //  `, Array.of(lessonId, commentId)));
  //  return R.merge(comment, { replies });
  //}, R.map(async comment => {
  //  return R.merge(comment, { dateAgo: timeAgo(comment.date) }); 
  //}, await query(`
  //  SELECT
  //    comment_id AS commentId,
  //    lesson_id AS lessonId,
  //    users.user_id AS userId,
  //    name,
  //    content,
  //    date
  //  FROM lesson_comments
  //  JOIN users ON users.user_id = lesson_comments.user_id
  //  WHERE lesson_id = ? AND reply_to IS NULL
  //`, Array.of(lessonId))));

  //res.json(R.merge(lessonSplittedTags, { uploads: lessonUploads , comments: lessonComments }));

  const lessonComments = await query(`
    SELECT
      comment_id AS commentId,
      lesson_id AS lessonId,
      users.user_id AS userId,
      name,
      content,
      date
    FROM lesson_comments
    JOIN users ON users.user_id = lesson_comments.user_id
    WHERE lesson_id = ? AND reply_to IS NULL
  `, lessonId);

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  const lessonCommentsWithReplies = await Promise.all(R.map( async (comment) => {
    const replies = await query(`
     SELECT
       comment_id AS commentId,
       lesson_id AS lessonId,
       users.user_id AS userId,
       name,
       content,
       date
     FROM lesson_comments
     JOIN users ON users.user_id = lesson_comments.user_id
     WHERE reply_to = ?
   `, R.prop("commentId", comment));

    return R.merge(comment, { replies });
  } , lessonComments));

  const lessonCommentsWithRepliesAndAgo = R.map(comment => {
    const agoReplies = R.map(reply => {
      return R.merge(reply, { dateAgo: timeAgo(R.prop("date", reply)).capitalize() });
    }, comment.replies);

    return R.merge(comment, { replies: agoReplies, dateAgo: timeAgo(R.prop("date", comment)).capitalize() });
  }, lessonCommentsWithReplies);
  
  res.json(R.merge(lessonSplittedTags, { uploads: lessonUploads , comments: lessonCommentsWithRepliesAndAgo }));
});

/**
 * @api {post} /lessons Add a new lesson
 * @apiName AddLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *  	"title": "Ciclu hamiltonian de cost minim",
 *  	"content": "Continutul lectiei",
 *  	"authorId": 2,
 *    "tags": ["tag", "tag"]
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "success": true,
 *    "lessonId": 3
 * }
 */
router.post("/", async (req, res) => {
  console.log(req.body);
  console.log(req.files);
  const { title, content, authorId, tags } = req.body;
  const { insertId } = await query("INSERT INTO lessons (title, content, author_id, tags) VALUES (?, ?, ?, ?)",
    [ title, content, authorId, tags ]);

  if (req.files) {
    let { uploads } = req.files;
    
    if (!R.is(Array, uploads)) {
      uploads = [ uploads ];
    }

    await Promise.all(uploads.map(upload => {
      return new Promise((resolve) => {
        const originalName = upload.name;
        const mimeType = upload.mimetype;
        const fileContent = upload.data;

        const fileHash = sha1(fileContent);

        const fileName = randomstring.generate({ length: 20, charset: 'alphabetic' });

        upload.mv(`/usr/src/uploads/${fileName}`)
          .then(() => {
              query("INSERT INTO lesson_uploads (lesson_id, filename, original_filename, mime_type, file_hash) VALUES (?, ?, ?, ?, ?)",
                [ insertId, fileName, originalName, mimeType, fileHash ])
            .then(() => {
              resolve();
            });
          });
      });
    }));
    
  }

  res
    .status(201)
    .json({ success: true, lessonId: insertId });
});

/**
 * @api {put} /lessons/:lessonId Modify a lesson
 * @apiName ModifyLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParam {String} groupId The group id (useless, kept only for symmetrical purposes)
 * @apiParam {String} lessonId The lesson id
 *
 * @apiParamExample {json} Request example (only use the fields that you want to update):
 * {
 *   "title": "Noul nume al lecţiei",
 *   "content": "Noul conţinut",
 *   "tags": ["..."]
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *    "success": true
 *  }
 */
router.put("/:lessonId", async (req, res) => {
  const { lessonId } = req.params;

  const values = Array
    .of("title", "content", "authorId", "tags" )
    .map(item =>  ({
      key: item,
      value: req.body[item]
    }))
    .filter(item => !R.isEmpty(item.value) && !R.isNil(item.value));

  const keyEnumeration = R.join(", ", values.map(item => `${snake(item.key)}=?`));

  const valueEnumeration = values.map(item => item.value);

  await query(`UPDATE lessons SET ${keyEnumeration} WHERE lesson_id = ?`, R.append(lessonId, valueEnumeration));

  const oldFiles = R.split(",", R.prop("oldFiles", req.body));

  const existsingFileList = await query(`
    SELECT
      filename AS fileName,
      original_filename AS originalFilename,
      lesson_upload_id AS uploadId,
      file_hash AS fileHash
    FROM lesson_uploads
    WHERE lesson_id = ?
  `, lessonId);

  const existsingFileListFileNames = R.map(item => item.fileName, existsingFileList);

  const filesToDelete = R.difference(existsingFileListFileNames, oldFiles);

  for (const file of filesToDelete) {
    await query("DELETE FROM lesson_uploads WHERE filename = ?", file);
  }

  if (req.files) {
    let { uploads } = req.files;
    
    if (!R.is(Array, uploads)) {
      uploads = [ uploads ];
    }

    uploads = R.uniqBy(item => sha1(item.data), uploads);

    await Promise.all(uploads.map(upload => {
      return new Promise((resolve) => {
        const originalName = upload.name;
        const mimeType = upload.mimetype;
        const fileContent = upload.data;

        const fileHash = sha1(fileContent);
        console.log(`computed ${fileHash}`);

        const fileName = randomstring.generate({ length: 20, charset: 'alphabetic' });

        upload.mv(`/usr/src/uploads/${fileName}`)
          .then(() => {
              query("INSERT INTO lesson_uploads (lesson_id, filename, original_filename, mime_type, file_hash) VALUES (?, ?, ?, ?, ?)",
                [ lessonId, fileName, originalName, mimeType, fileHash ])
            .then(() => {
              resolve();
            });
          });
      });
    }));
  }

  res.json({ success: true });
});

/**
 * @api {delete} /lessons/:lessonId Delete a lesson
 * @apiName DeleteLesson
 * @apiGroup Lessons
 *
 * @apiPermission teacher
 * @apiHeader {String} Authorization Bearer [jwt]

 * @apiParam {String} lessonId The lesson id
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
 *   success: true
 * }
 */
router.delete("/:lessonId", jwtFilter, async (req, res) => {
  const { lessonId } = req.params;

  await query("DELETE FROM recommended_lessons WHERE lesson_id = ?", lessonId);
  await query("DELETE FROM lesson_uploads WHERE lesson_id = ?", lessonId);
  await query("DELETE FROM lesson_comments WHERE lesson_id = ?", lessonId);
  await query("DELETE FROM lessons WHERE lesson_id = ?", lessonId);
  res.status(201).json({ success: true });
});

module.exports = router;
