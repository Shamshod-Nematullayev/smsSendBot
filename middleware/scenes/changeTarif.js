const { Scenes, Markup } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { User } = require("../../model/User");
const { isExit } = require("./smallFunctions");
const axios = require("axios");

const changeTarif = new Scenes.WizardScene(
  "change_tarif",
  async (ctx) => {
    try {
      if (isExit(ctx))
        return ctx
          .reply("Kerakli menyuni tanlang", keyboards.menuKeyboard)
          .then(() => ctx.scene.leave());
      if (ctx.message.text) {
        const user = await User.findOne({ user_id: ctx.from.id });
        switch (ctx.message.text) {
          case "EKANOM":
            if (user.tarif.type != "EKANOM") {
              await ctx.reply(
                `EKANOM\n` +
                  `Bu tarif bo'yicha O'zbekiston bo'ylab yuborilgan barcha smslarga 60 so'm. ( Ucell abonentlariga 125 so'm).\n` +
                  `Oylik yoki kunlik to'lov mavjud emas. Har bir sms uchun to'lov sizning hisob raqamingizdan yechiladi.`,
                Markup.inlineKeyboard([
                  Markup.button.callback("Roziman", "confirm"),
                ])
              );
              return ctx.wizard.next();
            } else {
              return ctx.reply(`Siz allaqachon shu tarifdasiz!`);
            }
          case "BIZNES":
            if (user.tarif.type != "BIZNES") {
              await ctx.reply(
                `BIZNES\n` +
                  `SMS provider bilan tadbirkor o'rtasida shartnoma tuziladi. Bunda bizning xizmatimiz faqat sms yuborish uchun qulay interfeys vazifasini bajaradi. Bunda oylik to'lov 59 999 so'mni tashkil etadi.`,
                Markup.inlineKeyboard([
                  Markup.button.callback("Roziman", "confirm"),
                ])
              );
              ctx.wizard.state.tarif_type = "BIZNES";
              return ctx.wizard.next();
            } else {
              return ctx.reply(`Siz allaqachon shu tarifdasiz!`);
            }
        }
      }
    } catch (error) {
      ctx.replyWithHTML(messages.errorOccured, keyboards.exitKey);
    }
  },
  async (ctx) => {
    try {
      if (isExit(ctx)) return ctx.scene.leave();
      if (ctx.update.callback_query) {
        if (ctx.update.callback_query.data == "confirm") {
          if (ctx.wizard.state.tarif_type == "BIZNES") {
            const user = await User.findOne({ user_id: ctx.from.id });
            if (
              user.eskiz &&
              user.eskiz.token &&
              user.eskiz.email &&
              user.eskiz.password
            ) {
              await user.updateOne({ $set: { "tarif.type": "BIZNES" } });
              await ctx.editMessageText(
                `Hisoblash turi o'zgartirildi endi siz <b>BIZNES</b> tarifidasiz`,
                { parse_mode: "HTML" }
              );

              ctx.reply(`Kerakli menyuni tanlang`, keyboards.menuKeyboard);
              return ctx.scene.leave();
            } else {
              ctx.replyWithHTML(
                `eskiz.com hisobi ochilgan emailingizni kiriting!`
              );
              return ctx.wizard.next();
            }
          } else {
            await User.updateOne(
              { user_id: ctx.from.id },
              { $set: { ["tarif.type"]: "EKANOM" } }
            );
            ctx.editMessageText(
              `Hisoblash turi o'zgartirildi endi siz <b>EKANOM</b> tarifidasiz`,
              { parse_mode: "HTML" }
            );
            ctx.reply(`Kerakli menyuni tanlang`, keyboards.menuKeyboard);
            return ctx.scene.leave();
          }
        }
      }
    } catch (error) {
      ctx.replyWithHTML(messages.errorOccured, keyboards.exitKey);
    }
  },
  (ctx) => {
    try {
      if (ctx.message && ctx.message.text) {
        if (isExit(ctx)) return ctx.scene.leave();
        ctx.wizard.state.sms_login = ctx.message.text;
        ctx.reply(`SMS shlyuz parolini kiriting`);
        return ctx.wizard.next();
      } else {
        ctx.reply(`Faqat matnli xabar kiriting`);
      }
    } catch (error) {
      ctx.replyWithHTML(messages.errorOccured, keyboards.exitKey);
    }
  },
  async (ctx) => {
    try {
      if (ctx.message && ctx.message.text) {
        if (isExit(ctx))
          return ctx
            .reply("Kerakli menyuni tanlang", keyboards.menuKeyboard)
            .then(() => ctx.scene.leave());
        ctx.wizard.state.sms_password = ctx.message.text;

        fetch(`https://notify.eskiz.uz/api/auth/login`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: ctx.wizard.state.sms_login,
            password: ctx.wizard.state.sms_password,
          }),
        }).then(async (res) => {
          res.json().then(async (data) => {
            if (
              res.status == 401 &&
              data.message == "Неверный Email или пароль"
            ) {
              ctx.reply(data.message);
              ctx.reply(`SMS shlyuz parolini kiriting`, keyboards.exitKey);
            } else if (res.status == 200) {
              await User.updateOne(
                { user_id: ctx.from.id },
                {
                  $set: {
                    "tarif.type": "BIZNES",
                    eskiz: {
                      email: ctx.wizard.state.sms_login,
                      password: ctx.wizard.state.sms_password,
                      token: data.data.token,
                    },
                  },
                }
              );
              ctx.reply(
                `Tarif muvaffaqqiyatli o'zgartirildi va eskiz hisobiga ulanish mavjud`,
                keyboards.menuKeyboard
              );
              ctx.scene.leave();
            }
          });
        });
      } else {
        ctx.reply(`Faqat matnli xabar kiriting`);
      }
    } catch (error) {
      ctx.replyWithHTML(messages.errorOccured, keyboards.exitKey);
      console.log(error);
    }
  }
);

changeTarif.enter((ctx) => {
  ctx.replyWithHTML(`Qaysi tarifga o'tmoqchisiz?`, keyboards.chooseTarif);
});

module.exports = { changeTarif };
