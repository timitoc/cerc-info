const mysql = require("mysql");
const util = require("util");

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

// Load the body-parser module
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add logging
app.use(morgan('dev'));

app.use("/docs", express.static("docs"));

const groupRoutes = require("./api/routes/groups.js");

// Load API routes
const apiRouter = express.Router();
apiRouter.use("/groups", groupRoutes);

// Add API routes to the main application
app.use("/api", apiRouter);

module.exports = app;
