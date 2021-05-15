const app = require("express")();
require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { getPlexLib } = require("./src/plex/interface");
const {addLink, getDlStatus, sleep, cleanUp} = require("./src/jdownloader/jdownlaoder");
const { load } = require("dotenv");

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

bot.action("series", async (ctx) => {
  ctx.deleteMessage(ctx.inlineMessageId)
  const title = await addLink(url, moviesFolder)
  const message = await ctx.reply(`Downlaoding series ${title.name.split(".").join(" ")}` + " \u{1F39E}")
  await sleep(2000)
  updateStatus(title, message)
  url = null;
});

bot.action("movie", async (ctx) => {

  ctx.deleteMessage(ctx.inlineMessageId)
  const title = await addLink(url, moviesFolder)
  const message = await ctx.reply(`Downlaoding movie ${title.name.split(".").join(" ")}` + " \u{1F39E}")
  await sleep(2000)

  updateStatus(title, message)
  url = null;
});

async function updateStatus(title, message) {
  let finished = false;
  let loaded = 0;
while(!finished) {
    await sleep(1000)
    
    let status = await getDlStatus(title.uuid)
    finished = status[0].finished ? true : false
    console.log(status)
    let bytesLoaded = status[0].bytesLoaded
    let bytesTotal = status[0].bytesTotal
    let newLoaded = Math.round(((100  / bytesTotal) * bytesLoaded))
    if (loaded != newLoaded)  {
      loaded = newLoaded;
      bot.telegram.editMessageText(message.chat.id, message.message_id, "", `Downloading... ${loaded}%`)
    }
  }
    cleanUp(title.uuid)
  

  bot.telegram.editMessageText(message.chat.id, message.message_id, "", `Finished download ${title.name.split(".").join(" ")}`)
}

bot.hears('delete', (ctx) => {
  cleanUp(123)
}) 




bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
