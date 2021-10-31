const isAuth = require("./auth");
const log = require("../logger");
const Jdownlaoder = require("../jdownloader/jdownlaoder");
const { Markup } = require("telegraf");

const commands = (bot, settings) => {
  bot.start((ctx) => ctx.reply("Botzilla is booting.."));

  bot.help((ctx) =>
    ctx.reply("Following commands are available for now: \n /help \n /download")
  );

  bot.hears("hi", (ctx) => {
    console.log(ctx);
    ctx.reply("Hey there " + ctx.from.first_name);
  });

  // jdownloader commands
  let url = null;
  let password = null;

  bot.command("download", (ctx) => {
    isAuth(ctx, () => {
      if (ctx.message.text === "/download") {
        ctx.replyWithMarkdownV2(
          "You need to provide following data: /download *url*"
        );
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
  });

  bot.command("quit", (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id);

    // Using context shortcut
    ctx.leaveChat();
  });

  bot.command("pw", (ctx) => {
    isAuth(ctx, () => {
      if (ctx.message.text === "/pw") {
        ctx.replyWithMarkdownV2(
          "You need to provide following data: /pw *password* "
        );
      } else {
        password = ctx.message.text.slice(4, ctx.message.text.length);
        ctx.reply("password for next download set");
      }
    });
  });

  bot.action("series", async (ctx, myUrl) => {
    ctx.deleteMessage(ctx.inlineMessageId);
    try {
      let jd = new Jdownlaoder(ctx);
      const title = await jd.addLink(url, settings.serie_folder, password);
      if (title === "offline") {
        ctx.reply("This link seems to be offline or incorrect");
        return;
      }
      const message = await ctx.reply(
        `Downlaoding series ${title.name.split(".").join(" ")}` + " \u{1F39E}"
      );
      await jd.sleep(5000);
      updateStatus(title, message, jd);
    } catch (err) {
      log.error(err);
    }
    url = null;
    password = null;
  });

  bot.action("movie", async (ctx) => {
    ctx.deleteMessage(ctx.inlineMessageId);
    try {
      let jd = new Jdownlaoder(ctx);
      const title = await jd.addLink(url, settings.movie_folder, password);
      if (title === "offline") {
        ctx.reply("jDownloader is not reachable..");
        return;
      } else if (title === "dead") {
        ctx.reply("This link seems to be offline or incorrect");
        return;
      }
      const message = await ctx.reply(
        `Downlaoding movie ${title.name.split(".").join(" ")}` + " \u{1F39E}"
      );
      await jd.sleep(5000);
      updateStatus(title, message, jd);
    } catch (err) {
      log.error(err);
    }
    url = null;
    password = null;
  });

  async function updateStatus(title, message, jd) {
    log.info(`${message.chat.username} is ${message.text}`);
    let finished = false;
    let loaded = 0;
    while (!finished) {
      jd.sleep(10000)
      let status = await jd.getDlStatus(title.uuid);
      console.log(status)
      finished = status[0].finished ? true : false;
      let bytesLoaded = status[0].bytesLoaded;
      let bytesTotal = status[0].bytesTotal;
      let newLoaded = Math.round((100 / bytesTotal) * bytesLoaded);
      if (loaded != newLoaded) {
        loaded = newLoaded;
        bot.telegram.editMessageText(
          message.chat.id,
          message.message_id,
          "",
          `Downloading... ${loaded}%`
        );
      }
      await jd.sleep(10000);
    }
    jd.cleanUp(title.uuid);

    bot.telegram.editMessageText(
      message.chat.id,
      message.message_id,
      "",
      `Finished download ${title.name.split(".").join(" ")}`
    );
  }

  bot.launch();
};

module.exports = commands;
