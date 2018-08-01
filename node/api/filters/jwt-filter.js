const jwt = require("jsonwebtoken");

function jwtFilter(req, res, next) {
  const { authorization } = req.headers;
  if(!authorization) {
    return res
      .status(403)
      .json({ error: 'Missing Authorization header' });
  }

  if(!authorization.startsWith('Bearer ')) {
    return res
      .status(400)
      .json({ error: 'Invalid Authorization header' });
  }

  const token = authorization.substr('Bearer '.length);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err) {
      return res
        .status(400)
        .json({ error: 'Error decoding token' });
    }

    req.decodedToken = decoded;
    next();
  })
}

module.exports = jwtFilter;
