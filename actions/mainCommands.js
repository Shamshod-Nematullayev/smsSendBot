const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { keyboards } = require("../lib/keyboards");
const { messages } = require("../lib/messages");

const composer = new Composer();

composer.start((ctx) => {
  ctx.reply(messages.greeting, keyboards.menuKeyboard);
});

composer.hears("📓 Shablonlar", (ctx) => {
  ctx.reply(messages.shablonsEntered, keyboards.shablonsPanel);
});

bot.use(composer);
