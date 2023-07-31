const { Composer } = require("telegraf");
const { bot } = require("../core/bot");

const composer = new Composer();
composer.action("change_tarif", (ctx) => {
  ctx.scene.enter("change_tarif");
});

bot.use(composer);
