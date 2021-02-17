const app = require("express")();
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

bot.on("callback_query", (ctx) => {
  const plexLib = ctx.update.callback_query.data;
});

bot.command("plex", (ctx) => {
  return ctx.reply(
    "Plex",

    Markup.keyboard([
      Markup.button.callback("Movies", "bla"),
      Markup.button.callback("Series"),
    ]).resize()
  );
});

function getPlexLib() {
  axios
    .get(`http://192.168.0.123:32400/library/sections`, {
      headers: { "X-Plex-Token": "AQcGWezcruGz65h6NSNw" },
    })
    .then((res) => {
      const data = res.data;
      console.log(data);
      return ctx.reply(data.MediaContainer.size);
    })
    .catch((err) => console.log(err));
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
