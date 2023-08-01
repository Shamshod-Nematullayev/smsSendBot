const { Composer, Markup } = require("telegraf");
const { bot } = require("../core/bot");
const { keyboards } = require("../lib/keyboards");
const { messages } = require("../lib/messages");
const { User } = require("../model/User");

const composer = new Composer();

composer.start(async (ctx) => {
  try {
    const user = await User.findOne({ user_id: ctx.from.id });
    if (user.admin) {
      return ctx.reply("ADMIN DASHBOARD", keyboards.adminMenu);
    }
    if (!user) {
      await User.create({
        user_id: ctx.from.id,
        data: ctx.from,
      });
    }
    ctx.reply(messages.greeting, keyboards.menuKeyboard);
  } catch (error) {
    console.log(error);
  }
});

composer.hears("📓 Shablonlar", (ctx) => {
  ctx.reply(messages.shablonsEntered, keyboards.shablonsPanel);
});

composer.hears("👤 Shaxsiy kabinet", async (ctx) => {
  try {
    const user = await User.findOne({ user_id: ctx.from.id });
    ctx.replyWithHTML(
      `<b>Ma'lumotlaringiz:</b>\n` +
        `<b>Username</b>:       ${user.data.username}\n` +
        `<b>Hisob turi</b>:        <i>${user.tarif.type}</i>\n` +
        `<b>Hisobingizda</b>:   <code>${user.balance}</code> so'm\n` +
        `<b>Joriy oyda harajat: </b><code>${user.oylik_harajat}</code> so'm`,
      Markup.inlineKeyboard([
        [Markup.button.callback("Tarif almashtirish", "change_tarif")],
        [
          Markup.button.url(
            "Tariflar haqida ma'lumot",
            "https://t.me/c/1587843853/3"
          ),
        ],
      ])
    );
  } catch (error) {
    ctx.replyWithHTML(messages.errorOccured);
    console.log(error);
  }
});

bot.hears("⬅️Chiqish", (ctx) =>
  ctx.reply(`Kerakli menyuni tanlang!`, keyboards.menuKeyboard)
);
bot.use(composer);
