const { Scenes } = require("telegraf");
const { messages } = require("../../../lib/messages");
const { keyboards } = require("../../../lib/keyboards");
const { User } = require("../../../model/User");
const { isExit } = require("../smallFunctions");

const have_income = new Scenes.WizardScene(
  "incoming",
  async (ctx) => {
    try {
      if (isExit(ctx)) {
        ctx.reply(`Kerakli menyuni tanlang`, keyboards.adminMenu);
        return ctx.scene.leave();
      }
      if (isNaN(ctx.message.text)) {
        return ctx.reply(`Faqat son kiritilishi kerak`, keyboards.exitKey);
      }
      const user = await User.findOne({ user_id: ctx.message.text });
      if (user) {
        ctx.replyWithHTML(
          `<a href="${
            user.data.username ? "https://t.me/" + user.data.username : ""
          }" >${
            user.data.first_name
          }</a>\n Qancha summa balansiga kiritmoqchisiz? Faqat raqamlar bilan so'mda yozing`,
          {
            disable_web_page_preview: true,
            reply_markup: keyboards.exitKey.reply_markup,
          }
        );
        //   ctx.wizard.state.user_id = ctx.message.text;
        ctx.wizard.state.user = user;
        ctx.wizard.next();
      } else {
        ctx.reply(
          `Bunday ID raqamga ega foydalanuvchi aniqlanmadi. Boshqa ID raqam kiriting`,
          keyboards.exitKey
        );
      }
    } catch (err) {
      ctx.replyWithHTML(messages.errorOccured);
      console.log(err);
    }
  },
  async (ctx) => {
    try {
      // validation
      if (isExit(ctx)) {
        ctx.reply(`Kerakli menyuni tanlang`, keyboards.adminMenu);
        return ctx.scene.leave();
      }
      if (isNaN(ctx.message.text)) {
        return ctx.reply(`Faqat son kiritilishi kerak`, keyboards.exitKey);
      }

      console.log(await ctx.wizard.state.user);
      await User.updateOne(
        { user_id: ctx.wizard.state.user.user_id },
        {
          $set: {
            balance: ctx.wizard.state.user.balance + parseInt(ctx.message.text),
          },
        }
      );

      await ctx.telegram.sendMessage(
        ctx.wizard.state.user.user_id,
        `Sizning balansingizga <b>${ctx.message.text} </b> so'm qabul qilindi.`,
        { parse_mode: "HTML" }
      );
      await ctx.reply(
        `Hisob raqamga muvaffaqqiyatli pul ko'chirildi`,
        keyboards.adminMenu
      );
      ctx.scene.leave();
    } catch (err) {
      ctx.replyWithHTML(messages.errorOccured);
      console.log(err);
    }
  }
);

have_income.enter((ctx) => {
  ctx.reply(`Mijozning telegram id raqamini kiriting`);
});

module.exports = { have_income };
