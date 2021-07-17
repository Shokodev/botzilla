const express = require("express")
const app = express();
const logger = require("./logger")
require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const { getPlexLib } = require("./plex/interface");
const Jdownlaoder = require("./jdownloader/jdownlaoder");
const plexTitlesAmount = 3;
const settings = {
    serie_folder: process.env.SERIESFOLDER,
    movie_folder:process.env.MOVIESFOLDER,
    user_ids: process.env.USERIDS.split(","),
}

const port = process.env.PORT || 8080;
app.listen(port, () =>
    logger.info(`app listening on http://localhost:${port}`)
);

app.use(express.static(__dirname + '/public/'));
app.get(/.*!/, (req, res) => res.sendFile(__dirname + './public/index.html'));

app.get('/settings', (req, res) => {
    res.send(settings);
});

app.post('/settings', (req, res) => {
    settings = req.body.settings
    res.sendStatus(200);
})

//telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Botzilla is booting.."));

bot.help((ctx) =>
    ctx.reply("Following commands are available for now: \n /plex\n /help \n /download")
);

bot.hears("hi", (ctx) => {
    console.log(ctx);
    ctx.reply("Hey there " + ctx.from.first_name);
});

//plex commands
bot.command("plex", (ctx) => {
    getPlexLib(plexTitlesAmount).then((result) => {
        result.forEach((element) => {
            element.rating === undefined ?
                (element.rating = "none") :
                (element.rating = element.rating.toString().replace(".", ","));
            ctx.replyWithMarkdownV2(
                `*Title:* ${element.title.replace(/[)(]/g, ' ')} *Rating:* ${element.rating}`
            );
        });
    });
});

// jdownloader commands
let url = null;
let password = null;

bot.command("download", (ctx) => {
    auth(ctx, () => {
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
});

bot.command("pw", (ctx) => {
    auth(ctx, () => {
        if (ctx.message.text === "/pw") {
            ctx.replyWithMarkdownV2("You need to provide following data: /pw *password* ");
        } else {
            password = ctx.message.text.slice(4, ctx.message.text.length);
            ctx.reply("password for next download set");
        }
    });
});

bot.action("series", async(ctx) => {
    ctx.deleteMessage(ctx.inlineMessageId)
    try {
        let jd = new Jdownlaoder(ctx);
        const title = await jd.addLink(url, settings.serie_folder, password)
        if (title === "offline") {
            ctx.reply("This link seems to be offline or incorrect")
            return
        }
        const message = await ctx.reply(`Downlaoding series ${title.name.split(".").join(" ")}` + " \u{1F39E}")
        await jd.sleep(2000)
        updateStatus(title, message, jd)
    } catch (err) {
        logger.error(err);
    }
    url = null;
    password = null;
});

bot.action("movie", async(ctx) => {
    ctx.deleteMessage(ctx.inlineMessageId)
    try {
        let jd = new Jdownlaoder(ctx);
        const title = await jd.addLink(url, settings.movie_folder, password)
        if (title === "offline") {
            ctx.reply("This link seems to be offline or incorrect")
            return
        }
        const message = await ctx.reply(`Downlaoding movie ${title.name.split(".").join(" ")}` + " \u{1F39E}")
        await jd.sleep(2000)
        updateStatus(title, message, jd)

    } catch (err) {
        logger.error(err);
    }
    url = null;
    password = null;
});

async function updateStatus(title, message, jd) {
    logger.info(`${message.chat.username} is ${message.text}`)
    let finished = false;
    let loaded = 0;
    while (!finished) {
        let status = await jd.getDlStatus(title.uuid)
        finished = status[0].finished ? true : false
        let bytesLoaded = status[0].bytesLoaded
        let bytesTotal = status[0].bytesTotal
        let newLoaded = Math.round(((100 / bytesTotal) * bytesLoaded))
        if (loaded != newLoaded) {
            loaded = newLoaded;
            bot.telegram.editMessageText(message.chat.id, message.message_id, "", `Downloading... ${loaded}%`)
        }
        await jd.sleep(5000)
    }
    cleanUp(title.uuid)


    bot.telegram.editMessageText(message.chat.id, message.message_id, "", `Finished download ${title.name.split(".").join(" ")}`)
}

const auth = (ctx, command) => {
    if (Array.from(settings.user_ids).includes(ctx.update.message.from.id.toString())) {
        command();
    } else {
        ctx.reply("You are not authorized!")
    }
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

