const mysql = require("mysql");
const util = require("util");

if (!process.env.DOCKER) {
  require("dotenv").config();
}

const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

connection.connect();

const query = util.promisify(connection.query.bind(connection));
global.query = query;

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

app.get("/", (req, res) => {
  res.send(`
    <h3>Welcome!</h3>
    You are on this page, so this means everything worked as it was supposed to.
    
    <br/>
    The documentation is <a href="https://andreigasparovici.github.io/cerc-info/">here</a>
  `);
});

// Load the body-parser module
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add logging
app.use(morgan('dev'));

app.use("/docs", express.static("../docs"));

// Import routes
const groupRoutes = require("./api/routes/groups.js");
const inviteRoutes = require("./api/routes/invite.js");
const userRoutes = require("./api/routes/users.js");
const loginRoutes = require("./api/routes/login.js");
const registerRoutes = require("./api/routes/register.js");

// Load API routes
const apiRouter = express.Router();
apiRouter.use("/groups", groupRoutes);
apiRouter.use("/invite", inviteRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/login", loginRoutes);
apiRouter.use("/register", registerRoutes);

// Add API routes to the main application
app.use("/api", apiRouter);

module.exports = app;
