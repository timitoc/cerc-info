const jwt = require("jsonwebtoken");

function privilegeFilter(privilege) {
  return (req, res, next) => {
    if (!req.decodedToken) {
      return res
        .status(500)
        .json({ error: "Token not decoded!" });
    }
    const privilege = req.decodedToken.privilege;
    if (privilege !== privilege) {
      return res
        .status(401)
        .json({ error: "You don't have the rights required to access this route!" });
    }
    next();
  };
}

module.exports = privilegeFilter;
