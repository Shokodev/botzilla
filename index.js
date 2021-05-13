const app = require("express")();
require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { getPlexLib } = require("./src/plex/interface");
const addLink = require("./src/jdownloader/jdownlaoder");
let jdLink = addLink.addLink;

const plexTitlesAmount = 3;
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
  ctx.reply("Following commands are available for now: \n /plex\n /help \n /download")
);

bot.hears("hi", (ctx) => {
  ctx.reply("Hey there " + ctx.from.first_name);
});

//plex commands
bot.command("plex", (ctx) => {
  getPlexLib(plexTitlesAmount).then((result) => {
    result.forEach((element) => {
      element.rating === undefined
        ? (element.rating = "none")
        : (element.rating = element.rating.toString().replace(".", ","));
      ctx.replyWithMarkdownV2(
        "*Title:* " + element.title + " *Rating:* " + element.rating
      );
    });
  });
});

// jdownloader commands
const seriesFolder = process.env.SERIESFOLDER;
const moviesFolder = process.env.MOVIESFOLDER;
let url = null;

bot.command("download", (ctx) => {
  if (ctx.message.text === "/download") {
    ctx.replyWithMarkdownV2("You need to provide following data: /download *url*");
  } else {
    ctx.reply(
      "Choose media type",
      Markup.inlineKeyboard([
        [{ text: "series", callback_data: "series" }],
        [{ text: "movie", callback_data: "movie" }],
      ])
    );

    url = ctx.message;
  }
});

bot.action("series", (ctx) => {
  ctx.deleteMessage(ctx.inlineMessageId)
  ctx.reply("Downlaoding series " + "\u{1F44D}");
  jdLink(url, seriesFolder);
  url = null;
});

bot.action("movie", (ctx) => {
  ctx.deleteMessage(ctx.inlineMessageId)
  ctx.reply("Downlaoding movie " + "\u{1F44D}");
  jdLink(url, moviesFolder);
  url = null;
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
