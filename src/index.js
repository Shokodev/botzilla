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

bot.command("plex", (ctx) => {
  getPlexLib().then((result) => {
    ctx.reply(
      "Recently ned added titles are:\n- " +
        result[0] +
        "\n- " +
        result[1] +
        "\n- " +
        result[2] +
        "\n"
    );
  });
});

async function getPlexLib() {
  url = "http://192.168.0.123:32400/library/recentlyAdded";
  console.log();
  let res = await axios.get(url, {
    headers: { "X-Plex-Token": "AQcGWezcruGz65h6NSNw" },
  });
  let plexRecent = [];
  let i;
  for (i = 0; i < 3; i++) {
    plexRecent.push(res.data.MediaContainer.Metadata[i].title);
  }
  console.log(res.data.MediaContainer.Metadata[0]);
  return plexRecent;
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
