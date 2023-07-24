const { Scenes } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { Shablon } = require("../../model/Shablon");
const { isExit } = require("./smallFunctions");

const createShablon = new Scenes.WizardScene(
  "CREATE_SHABLON",
  (ctx) => {
    try {
      if (isExit(ctx)) {
        return ctx.scene.leave();
      }
      if (ctx.message && ctx.message.text.length > 15) {
        const matchedVariebles = [];
        const matchResult = ctx.message.text.match(/(\[[a-zA-Z_]*\])/g);

        if (matchResult !== null) {
          matchResult.forEach((matched) => {
            if (matched) matchedVariebles.push(matched);
          });

          ctx.scene.state.variables = matchedVariebles;
          ctx.scene.state.text = ctx.message.text;
          ctx.reply(`Endi shablon uchun nom kiriting!`, keyboards.exitKey);
          ctx.wizard.next();
        } else {
          ctx.reply(messages.noVaraibleErr, keyboards.exitKey);
        }
      } else {
        ctx.reply(messages.enterMinimumShablonText);
      }
    } catch (error) {
      console.log(error);
      ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
    }
  },
  async (ctx) => {
    try {
      if (isExit(ctx)) {
        return ctx.scene.leave();
      }
      if (ctx.message && ctx.message.text.length < 3) {
        ctx.reply("Shablon nomi kamida 3 ta harf bo'lishi kerak");
      }
      if (ctx.message && ctx.message.text.length > 15) {
        ctx.reply("Shablon nomi 15 ta belgidan oshmasligi lozim");
      }
      ctx.wizard.state.name = ctx.message.text;
      await Shablon.create({
        ...ctx.wizard.state,
        user_id: ctx.from.id,
      });
      ctx.reply("Muvaffaqqiyatli qo'shildi ✅✅", keyboards.menuKeyboard);
      ctx.scene.leave();
    } catch (error) {
      console.log(error);
      ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
    }
  }
);
createShablon.enter((ctx) => {
  ctx.reply(messages.enterShablonText, {
    parse_mode: "HTML",
  });
});
createShablon.leave((ctx) => {
  ctx.reply(messages.backMenu, keyboards.menuKeyboard);
});

module.exports = { createShablon };
