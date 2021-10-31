
const user_ids = process.env.USERIDS.split(",")

const auth = (ctx, command) => {
    if (Array.from(user_ids).includes(ctx.update.message.from.id.toString())) {
        command();
    } else {
        ctx.reply("You are not authorized!")
    }
}

module.exports = auth;