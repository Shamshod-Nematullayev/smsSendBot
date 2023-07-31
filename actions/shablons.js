const { Composer, Markup } = require("telegraf");
const { bot } = require("../core/bot");
const { keyboards } = require("../lib/keyboards");
const { messages } = require("../lib/messages");
const { Shablon } = require("../model/Shablon");

const composer = new Composer();

composer.hears("➕Shablon yaratish", (ctx) =>
  ctx.scene.enter("CREATE_SHABLON")
);

composer.hears("📂Shablonlarni ko'rish", async (ctx) => {
  try {
    const shablons = await Shablon.find({ user_id: ctx.from.id });
    shablons.forEach((shablon) => {
      ctx.reply(
        shablon.text,
        Markup.inlineKeyboard([
          Markup.button.callback("🗑 O'chirish", "deleteShablon_" + shablon._id),
          Markup.button.callback("✉️ SMS yuborish", "sendSms_" + shablon._id),
        ])
      );
    });
  } catch (error) {
    console.log(error);
    ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
  }
});

composer.action(/(deleteShablon_)\w+/g, async (ctx) => {
  try {
    const _id = ctx.update.callback_query.data.split("_")[1];
    await Shablon.findByIdAndDelete(_id);
    ctx.deleteMessage();
    ctx.reply(`O'chirib tashlandi`);
  } catch (error) {
    console.log(error);
    ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
  }
  console.log();
});

composer.action(/(sendSms_)\w+/g, async (ctx) => {
  try {
    const shablon = await Shablon.findById(
      ctx.update.callback_query.data.split("_")[1]
    );
    ctx.session.shablon = shablon;
    ctx.scene.enter("SEND_SMS_2");
  } catch (error) {
    console.log(error);
    ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
  }
  console.log();
});

bot.use(composer);
