const express = require("express");
const questionRoutes = require("./question.routes");

const app = express();

app.use(express.json());
app.use("/api", questionRoutes);

module.exports = app;

