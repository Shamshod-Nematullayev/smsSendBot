const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { keyboards } = require("../lib/keyboards");

const composer = new Composer();
composer.on("message", (ctx) => {
  ctx.reply(`Kerakli menyuni tanlang`, keyboards.menuKeyboard);
});

bot.use(composer);
