const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

// Load the body-parser module
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add logging
app.use(morgan('dev'));

app.get("/test", (req, res) => res.send("IT WORKS"));

const lessonRoutes = require("./api/routes/lessons.js");

// Load API routes
const apiRouter = express.Router();
apiRouter.use("/lessons", lessonRoutes);

// Add API routes to the main application
app.use("/api", apiRouter);

module.exports = app;
