const { Composer, Markup } = require("telegraf");
const { bot } = require("../core/bot");
const { Shablon } = require("../model/Shablon");

const composer = new Composer();

composer.hears("✉️ SMS yuborish", (ctx) => {
  ctx.scene.enter("SENDING_SMS");
});

bot.use(composer);
