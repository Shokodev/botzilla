const express = require("express");
const app = express();
const log = require("./logger");
require("dotenv").config();
const botInstance = require("./telegraf/bot");
const botCommands = require("./telegraf/commands");

let settings = {
  serie_folder: process.env.SERIESFOLDER,
  movie_folder: process.env.MOVIESFOLDER,
};

if (process.env.BOT_TOKEN) {
  botCommands(botInstance, settings);
}

const port = process.env.PORT || 8082;
app.listen(port, () => log.info(`app listening on http://localhost:${port}`));
app.use(express.json());
app.use(express.static(__dirname + "/public/"));
app.get(/.*!/, (req, res) => res.sendFile(__dirname + "./public/index.html"));

app.get("/settings", (req, res) => {
  log.info("GET settings");
  res.send(settings);
});

app.post("/settings", (req, res) => {
  log.info("Save settings");
  try {
    settings = req.body;
    res.sendStatus(200);
  } catch (err) {
    log.error(`Save settings failed: ${err}`);
    res.sendStatus(500);
  }
});
