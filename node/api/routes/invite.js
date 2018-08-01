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
 * @api {post} /invite/teacher Generate invitation for a teacher
 * @apiName InviteTeacher
 * @apiGroup Invitations
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "email": "john_smith@gmail.com",
 *   "groupId": 2
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
     "succes": true,
     "previewUrl": "https://ethereal.email/message/W2FI7F.N1gyNXi9eW2FI7g9ALQzbRAJiAAAAAb76SgwS8fklYkNkjbQEUPc"
 *  }
 */
router.post("/teacher", jwtFilter, adminFilter, async (req, res) => {
  const { email, groupId } = req.body;
  const codeValue = randomstring.generate(5).toUpperCase();
  const { insertId } = await query("INSERT INTO invitation_codes (code, groupId, privilege, email) VALUES (?, ?, ?, ?)",
    [ codeValue, groupId, 1, email ]);

  // Using Ethereal mail (just for testing)
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    const mailOptions = {
      from: '"Cerc informatică " <invite@cercinfo.ro>',
      to: email,
      subject: 'Invitaţie',
      text: `
          Salut!\nCodul tău este ${codeValue}.\nFoloseşte-l pentru a îţi crea un cont de profesor pe platformă.
      `,
      html: `
          Salut! <br/>
          Codul tău este: <b>${codeValue}</b>. <br/>
          Foloseşte-l pentru a îţi crea un cont de profesor pe platformă.
      `
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
});

/**
 * @api {post} /invite/student Generate invitation for a student
 * @apiName InviteStudent
 * @apiGroup Invitations
 *
 * @apiPermission administrator
 * @apiHeader {String} Authorization Bearer [jwt]
 *
 * @apiParamExample {json} Request example:
 * {
 *   "email": "john_smith@gmail.com",
 *   "groupId": 2
 * }
 * 
 * @apiSuccessExample {json} Success response:
 * HTTP 201 OK
 * {
     "succes": true,
     "previewUrl": "https://ethereal.email/message/W2FI7F.N1gyNXi9eW2FI7g9ALQzbRAJiAAAAAb76SgwS8fklYkNkjbQEUPc"
 *  }
 */
router.post("/student", jwtFilter, adminFilter, async (req, res) => {
  const { email, groupId } = req.body;
  const codeValue = randomstring.generate(5).toUpperCase();
  const { insertId } = await query("INSERT INTO invitation_codes (code, groupId, privilege, email) VALUES (?, ?, ?, ?)",
    [ codeValue, groupId, 0, email ]);

  // Using Ethereal mail (just for testing)
  nodemailer.createTestAccount((err, account) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
    const mailOptions = {
      from: '"Cerc informatică " <invite@cercinfo.ro>',
      to: email,
      subject: 'Invitaţie',
      text: `
          Salut!\nCodul tău este ${codeValue}.\nFoloseşte-l pentru a îţi crea un cont de elev pe platformă.
      `,
      html: `
          Salut! <br/>
          Codul tău este: <b>${codeValue}</b>. <br/>
          Foloseşte-l pentru a îţi crea un cont de elev pe platformă.
      `
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
 *    error: "Code not found!"
 * }
 * @apiErrorExample {json} Error: Code already used
 * HTTP 200
 * {
 *    error: "Code already used!"
 * }
 */
router.get("/validate/:inviteCode", async (req, res) => {
  const { inviteCode } = req.params;
  const code = R.head(await query("SELECT * FROM invitation_codes WHERE code = ?", inviteCode));
  if (R.isNil(code))
    return res.json({
      error: "Code not found!"
    });
  if (code.used)
    return res.json({
      error: "Code already used!"
    });
  res.json({
    valid: true,
    email: code.email,
    privilege: code.privilege
  });
});

module.exports = router;
