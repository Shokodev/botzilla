const { Telegraf, Markup } = require("telegraf");
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.on('callback_query', ctx =>{
    const plexLib = ctx.update.callback_query.data;
})
bot.hears("hi", (ctx) => ctx.reply("Hey there"));


bot.command("special", (ctx) => {
  return ctx.reply(
    "Special buttons keyboard",
    Markup.keyboard([
      Markup.button.contactRequest("Send contact"),
      Markup.button.locationRequest("Send location"),
    ]).resize()
  );
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


function mytest() {
  return "test";
}
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
