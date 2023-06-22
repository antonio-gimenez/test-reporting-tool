const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const config = require("./env.js");
const routes = require("./routes.js");
const { port, env } = require("./env.js");

app.use(cors());

app.set("port", port);
app.set("env", env);
mongoose.set("strictQuery", true);
mongoose.connect(config.db, (err) => {
  if (err) {
    return console.error(`Error connecting to the database: ${err}`);
  }
  server.listen(app.get("port"), () => {
    console.log(`API REST on localhost:${port}`);
  });
});

app.use(bodyParser.json());
// extend the payload size
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api", routes);

module.exports = app;
