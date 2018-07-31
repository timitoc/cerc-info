const express = require('express');
const router = express.Router();

/**
 * @api {get} /groups Get all groups
 * @apiName GetUser
 * @apiGroup Groups
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 201 OK
 *     [{
 *        groupId: 3,
 *        groupName: "Clasa a X-a",
 *        groupDescription: "Grup de pregătire pentru olimpiada de informatică" 
 *     }, {
 *        groupId: 4,
 *        groupName: "Clasa a XII-a",
 *        groupDescription: "Grup de pregătire pentru olimpiada de informatică" 
 *     }]
 */
router.post("/login", (req, res) => {
});

module.exports = router;
