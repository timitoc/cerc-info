const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const R = require("ramda");
const randomstring = require("randomstring");
const nodemailer = require('nodemailer');

const { query } = global;

const jwtFilter = require("../filters/jwt-filter.js");
const privilegeFilter = require("../filters/privilege-filter.js");
const adminFilter = privilegeFilter(2);

const router = express.Router();

/**
 * @api {post} /invite Generate invitation for a teacher
 * @apiGroup Invitations
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "email": "john_smith@gmail.com",
 *   "groupId": 2,
 *   "type": "teacher"
 * }
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
     "succes": true
 *  }
 */
router.post("/", jwtFilter, adminFilter, async (req, res) => {
  const { email, groupId, type } = req.body;
  console.log(type);
  const codeValue = randomstring.generate(5).toUpperCase();
  const { insertId } = await query("INSERT INTO invitation_codes (code, group_id, privilege, email) VALUES (?, ?, ?, ?)",
    [ codeValue, groupId, type == "teacher" ? 1 : 2, email ]);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_SERVER,
    port: process.env.EMAIL_SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: '"Cerc informatică " <cercinfobrasov@mail.com>',
    to: email,
    subject: 'Invitaţie',
    text: `
       Salut!\nCodul tău este ${codeValue}.\nFoloseşte-l pentru a îţi crea un cont de ${type == "teacher" ? "profesor" : "elev"} pe platformă.
    `,
    html: `
        Salut! <br/>
        <a href="http://localhost:4200/register/${codeValue}">Link activare cont</a>
        <br/>
        TO-DO: Write beautiful message
    `
    //Codul tău este: <>${codeValue}</b>. <br/>
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.json({
        succes: false,
        error
      });
    }
    res.json({
      succes: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  });
});

/**
 * @api {get} /invite/validate/:inviteCode Validate invite code
 * @apiName ValidateInviteCode
 * @apiGroup Invitations
 *
 * @apiParam {String} inviteCode The invitation code
 *
 * @apiSuccessExample {json} Success response:
 * HTTP 200 OK
 * {
 *    valid: true,
 *    email: "john_smith@gmail.com",
 *    privilege: 0,
 * }
 * @apiErrorExample {json} Error: Code not found
 * HTTP 200
 * {
 *    error: "Cod inexistent!"
 * }
 * @apiErrorExample {json} Error: Code already used
 * HTTP 200
 * {
 *    error: "Codul a fost deja folosit!"
 * }
 */
router.get("/validate/:inviteCode", async (req, res) => {
  const { inviteCode } = req.params;
  const code = R.head(await query("SELECT * FROM invitation_codes WHERE code = ?", inviteCode));
  if (R.isNil(code))
    return res.json({
      error: "Cod inexistent!"
    });
  if (code.used)
    return res.json({
      error: "Codul a fost deja folosit!"
    });
  res.json({
    valid: true,
    email: code.email,
    privilege: code.privilege
  });
});

module.exports = router;
