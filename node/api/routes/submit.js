const express = require("express");
const R = require("ramda");
const randomstring = require("randomstring");
const sha1 = require("node-sha1");
const fileUpload = require('express-fileupload');
const fs = require("fs");
//const serveIndex = require('serve-index');

const { query } = global;
const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

router.use(fileUpload());

async function isHomeworkSubmitted(homeworkId, userId) {
  const queryResult = R.head(await query("SELECT 1 FROM submit WHERE homework_id = ? AND user_id = ?", Array.of(homeworkId, userId)));
  return !R.isNil(queryResult);
}

router.get("/download/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const uploadObject = R.head(await query(
    "SELECT original_filename AS originalName, mime_type AS mimeType FROM submit_uploads WHERE filename = ?", fileName));

  if (R.isNil(uploadObject)) {
    return res.status(404);
  }

  const { originalName, mimeType } = uploadObject;

  res.attachment(originalName);
  res.type(mimeType);

  const fileContent = fs.readFileSync(`/usr/src/uploads/${fileName}`);
  res.send(fileContent);
});


router.get("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;

  const submitId = R.prop("submitId", R.head(await query("SELECT submit_id AS submitId FROM submit WHERE homework_id = ?", homeworkId)));

  if (!submitId)
    return [];

  const submitTasks = await query(`
    SELECT
      submit_id AS submitId,
      upload_id AS uploadId,
      task_id AS taskId,
      link,
      (link IS NULL) AS type
    FROM submit_task
    WHERE submit_id = ?
  `, submitId);

  const submitTasksWithFiles = await Promise.all(
    R.map(item => new Promise((resolve) => {
      if (item.type && item.uploadId) {
         query(`
            SELECT
              original_filename AS fileName,
              filename AS uploadFileName,
              mime_type AS mimeType,
              file_hash AS hash,
              CONCAT("/submit/download/", filename) AS url
            FROM submit_uploads
            WHERE submit_upload_id = ?
          `, item.uploadId)
          .then(submitUploads => {
            return resolve(R.merge(item, { upload: R.head(submitUploads) }));
          });
      }
      else resolve(item);
  }), submitTasks));

  console.log(submitTasksWithFiles);

  res.json(submitTasksWithFiles);
});


function uploadFile(upload) {
  return new Promise(resolve => {
    const originalName = upload.name;
    const mimeType = upload.mimetype;
    const fileContent = upload.data;

    const fileHash = sha1(fileContent);

    const fileName = randomstring.generate({ length: 20, charset: 'alphabetic' });

    upload.mv(`/usr/src/uploads/${fileName}`)
      .then(() => {
        resolve({ fileName, fileHash }); 
      });
  });
}

router.post("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;
  const { userId } = req.decodedToken;
  const submitData = JSON.parse(R.prop("submitData", req.body));

  const isSubmitted = await isHomeworkSubmitted(homeworkId, userId);

  const uploads = R.prop("uploads", req.files);
  const files = 
    R.is(Array, uploads) ?
    uploads :
    Array.of(uploads);

  const submitWithLink = R.filter(item => item.type == 0, submitData);
  const submitWithFile = R.filter(item => item.type == 1, submitData);

  const submitWithLinkNonEmpty = R.filter(item => !R.isEmpty(R.prop("link", item)), submitWithLink);

  const submitId = !isSubmitted ? 
    R.prop("insertId",
      await query("INSERT INTO submit (homework_id, user_id) VALUES (?, ?)", 
      Array.of(homeworkId, userId ))) : 
    R.prop("submitId", R.head(await query("SELECT submit_id AS submitId FROM submit WHERE homework_id = ?",
      Array.of(homeworkId)))) ;

  console.log("isSubmitted", isSubmitted);
  console.log("submitId", submitId);

  const submitWithLinkPromises = !isSubmitted ? 
    await Promise.all(R.map(item => query(`
        INSERT INTO submit_task (submit_id, task_id, link, upload_id)
        VALUES (?, ?, ?, NULL)
      `, Array.of(submitId, item.taskId, item.link))
      , submitWithLinkNonEmpty)) :
   await Promise.all(R.map(item => query(`
        UPDATE submit_task SET link = ?
        WHERE submit_id = ? AND task_id = ?
      `, Array.of(item.link, submitId, item.taskId))
      , submitWithLinkNonEmpty));

  const submitWithFileNonEmpty = R.filter(item => R.has("fileIndex", item), submitWithFile);
  const submitWithFileAttached = R.map(item => R.merge(item, { file: files[item.fileIndex] }), submitWithFileNonEmpty);

  const submitWithFilePromises = await R.map(item => new Promise(resolve => {

    const { taskId } = item;

    query(`
      SELECT
        submit_task.upload_id AS submitUploadId
      FROM submit_task
      WHERE submit_id = ? AND task_id = ?
      `, Array.of(submitId, taskId))
      .then(data => {
        const isUpload = !R.isNil(R.head(data));
        const submitUploadId = R.prop("submitUploadId", R.head(data));
        
        if (!isUpload) {
          const upload = item.file;

          const originalName = upload.name;
          const mimeType = upload.mimetype;
          const fileContent = upload.data;

          uploadFile(item.file)
          .then(data => {
            const { fileName, fileHash } = data;
            query("INSERT INTO submit_uploads (filename, original_filename, mime_type, file_hash) VALUES (?, ?, ?, ?)",
            [ fileName, originalName, mimeType, fileHash ])
            .then(queryResult => {
              const { insertId } = queryResult;

              query("INSERT INTO submit_task (submit_id, task_id, link, upload_id) VALUES (?, ?, NULL, ?)",
                [ submitId, item.taskId, insertId ])
              .then(() => {
                resolve();
              });
            });
          });
        
        } else {
          console.log("UPDATE");
          const upload = item.file;

          const originalName = upload.name;
          const mimeType = upload.mimetype;
          const fileContent = upload.data;

          uploadFile(item.file)
          .then(data => {
            const { fileName, fileHash } = data;
            query("UPDATE submit_uploads SET filename = ?, original_filename = ?, mime_type = ?, file_hash = ? WHERE submit_upload_id = ?",
              Array.of(fileName, originalName, mimeType, fileHash, submitUploadId))
            .then(() => resolve());
          });
        }
      });

  }), submitWithFileAttached);

  res.json(true);
});

module.exports = router;
