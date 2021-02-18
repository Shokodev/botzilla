const app = require("express")();
const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

//web
app.get("/", (req, res) => res.json({ message: "Telegram bot" }));
const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`app listening on http://localhost:${port}`)
);

//telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Botzilla is booting.."));

bot.help((ctx) =>
  ctx.reply("Following commands are available for now: \n /plex\n /help")
);

bot.hears("hi", (ctx) => {
  ctx.reply("Hey there " + ctx.from.first_name);
});

bot.command("plex", (ctx) => {
  getPlexLib().then((result) => {
    ctx.reply(result);
  });
});

async function getPlexLib() {
  url = "http://192.168.0.123:32400/library/recentlyAdded";
  console.log()
  let res = await axios.get(url, {
    headers: { "X-Plex-Token": "AQcGWezcruGz65h6NSNw" },
  });
  console.log(res.data.MediaContainer.Metadata[1].title)

  return res.data.MediaContainer.Metadata[1].title;
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
