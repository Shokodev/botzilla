const app = require("express")();
const axios = require("axios");
const { Telegraf } = require("telegraf");
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

//TODO
bot.command("plex", (ctx) => {
  getPlexLib().then((result) => {
    const amount = 3;
    cutResult = result.slice(0,amount)
    ctx.reply(
      cutResult
    );
  });
});

async function getPlexLib() {
  url = "http://192.168.0.123:32400/library/recentlyAdded";
  let res = await axios.get(url, {
    headers: { "X-Plex-Token": "AQcGWezcruGz65h6NSNw" },
  });

  const plexRec = res.data.MediaContainer.Metadata.map((movie) => ({
    title: movie.title,
    rating: movie.rating,
  }));
  return plexRec;
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
