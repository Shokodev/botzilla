const app = require("express")();
const {getPlexLib} = require("./plex/interface")
const { Telegraf} = require("telegraf");
require("dotenv").config();


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
  ctx.reply("Following commands are available for now: \n /plex\n /help")
);

bot.hears("hi", (ctx) => {
  ctx.reply("Hey there " + ctx.from.first_name);
});




//TODO
bot.command("plex", (ctx) => {
  getPlexLib(plexTitlesAmount).then((result) => {
    result.forEach(element => {
      element.rating === undefined ? element.rating = "none" : element.rating = element.rating.toString().replace(".",",")
      ctx.replyWithMarkdownV2(
        "*Title:* " + element.title + " *Rating:* " + element.rating
      );
    })
  });
});


bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
