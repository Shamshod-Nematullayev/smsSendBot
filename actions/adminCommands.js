const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { User } = require("../model/User");

const composer = new Composer();

composer.hears("Pul urish", async (ctx) => {
  const user = await User.findOne({ user_id: ctx.from.id });
  if (user.admin) {
    ctx.scene.enter("incoming");
  }
});

bot.use(composer);
