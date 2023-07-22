const { Scenes } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { Shablon } = require("../../model/Shablon");
const { isExit } = require("./smallFunctions");

const createShablon = new Scenes.WizardScene("CREATE_SHABLON", (ctx) => {
  try {
    if (isExit(ctx)) {
      return ctx.scene.leave();
    }
    if (ctx.message && ctx.message.text.length < 15) {
      ctx.reply(messages.enterMinimumShablonText);
    }
  } catch (error) {
    console.log(error);
    ctx.reply(messages.errorOccured);
  }
});
createShablon.enter((ctx) => {
  ctx.reply(messages.enterShablonText);
});
createShablon.leave((ctx) => {
  ctx.reply(messages.backMenu, keyboards.menuKeyboard);
});

module.exports = { guvohnomaKiritishScene };
