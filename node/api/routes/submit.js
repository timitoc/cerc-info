const express = require("express");
const R = require("ramda");
const randomstring = require("randomstring");
const sha1 = require('node-sha1');

const fileUpload = require('express-fileupload');
//const serveIndex = require('serve-index');

const { query } = global;
const jwtFilter = require("../filters/jwt-filter.js");

const router = express.Router();

router.use(fileUpload());

router.post("/:homeworkId", jwtFilter, async (req, res) => {
  const { homeworkId } = req.params;
  const { userId } = req.decodedToken;
  const submitData = JSON.parse(R.prop("submitData", req.body));

  //TODO: do not create new submit if there is an existing one

  const submitId = R.prop("insertId", await query("INSERT INTO submit (homework_id, user_id) VALUES (?, ?)", [ homeworkId, userId ]));

  const { uploads } = req.files;
  const files = 
    R.is(Array, uploads) ?
    uploads :
    Array.of(uploads);

  const submitWithLink = R.filter(item => R.has("link", item), submitData);
  const submitWithFile = R.filter(item => !R.has("link", item), submitData);

  const mapIndexed = R.addIndex(R.map);

  const submitWithFileAttached = mapIndexed((item, index) => R.merge(item, { file: R.nth(index, files) }), submitWithFile);

  const submitWithLinkPromises = await Promise.all(R.map(item => query(`
    INSERT INTO submit_task (submit_id, task_id, link, upload_id)
    VALUES (?, ?, ?, NULL)
  `, Array.of(submitId, item.taskId, item.link))
  , submitWithLink));

  const submitWithFilePromises = R.map(item => new Promise(resolve => {
    const upload = item.file;

    const originalName = upload.name;
    const mimeType = upload.mimetype;
    const fileContent = upload.data;

    const fileHash = sha1(fileContent);

    const fileName = randomstring.generate({ length: 20, charset: 'alphabetic' });

    upload.mv(`/usr/src/uploads/${fileName}`)
      .then(() => {
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
  }), submitWithFileAttached);

  res.json(true);
});

module.exports = router;
