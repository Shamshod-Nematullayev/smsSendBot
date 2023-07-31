const { Scenes, Markup } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { Shablon } = require("../../model/Shablon");
const { isExit } = require("./smallFunctions");
const { toExcel } = require("to-excel");
const excelToJson = require("convert-excel-to-json");
const https = require("https");
const { bot } = require("../../core/bot");
const fs = require("fs");

const sendSMSfromShablon = new Scenes.WizardScene("SEND_SMS_2", async (ctx) => {
  try {
    if (ctx.message && isExit(ctx)) {
      return ctx.scene.leave();
    }
    // tasdiqlash tugmasi tekshiruvi
    if (
      ctx.update &&
      ctx.update.callback_query &&
      ctx.update.callback_query.data == "confirm"
    ) {
      // smslarni yuborish uchun jo'natish funksiyasi yoziladigan joy
      // jo'natib bo'lgandan keyin ko'rinadigan xabar
      return ctx.editMessageCaption(`Xabarlar yuborildi`);
    }
    // excel file tekshiruvi
    if (
      ctx.message.document &&
      ctx.message.document.mime_type === "application/vnd.ms-excel"
    ) {
      ctx.reply(messages.pleaseWait);
      const fileLink = await ctx.telegram.getFileLink(
        ctx.message.document.file_id
      );
      // excel filega ishlov berish boshlandi
      const excelFile = fs.createWriteStream("./input.xls");
      https.get(fileLink.href, (res) => {
        res.pipe(excelFile);
        excelFile.on("finish", async (cb) => {
          excelFile.close(cb);
          const result = await excelToJson({
            sourceFile: "input.xls",
          });
          if (result.input) {
            const shablon = ctx.session.shablon;
            let umumiyText = ``;

            result.input.forEach(async (row, i) => {
              if (i !== 0) {
                let messageText = ``;
                let text = `+998${row.A} ga \n ${shablon.text}`;
                for (let j = 0; j < shablon.variables.length; j++) {
                  const variable = shablon.variables[j];
                  let rgx = new RegExp("(\\[" + variable + "*\\])", "g");
                  messageText = text.replace(rgx, row[Object.keys(row)[j + 1]]);
                  text = text.replace(rgx, row[Object.keys(row)[j + 1]]);
                }
                umumiyText +=
                  messageText +
                  "\n\n---------------------------------------------------\n";
              }
            });
            let filename = Date.now() + ".txt";
            await fs.writeFile(
              filename,
              umumiyText,
              { encoding: "utf-8" },
              (err) => {
                if (err) throw err;
              }
            );
            await ctx.replyWithDocument(
              {
                source: filename,
                filename: "review.txt",
              },
              Markup.inlineKeyboard([
                Markup.button.callback("Tasdiqlash", "confirm"),
              ])
            );
            fs.unlink(filename, (err) => {
              if (err) console.log(err);
            });
            ctx.wizard.next();
          } else {
            ctx.reply(
              "Excel fileda asosiy input listi mavjud emas. Qo'llanmaga qarang"
            );
          }
        });
      });
    } else {
      ctx.reply("Bu excel file emas", keyboards.exitKey);
    }
  } catch (error) {
    console.log(error);
    ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
  }
});
sendSMSfromShablon.enter(async (ctx) => {
  ctx.replyWithDocument(
    { source: "input.xls" },
    {
      caption:
        "Ushbu faylga o'zgaruvchi qiymatlarini joylashtirib botga qayta yuboring!",
      reply_markup: keyboards.exitKey.reply_markup,
    }
  );
});
sendSMSfromShablon.leave((ctx) => {
  ctx.reply(messages.backMenu, keyboards.menuKeyboard);
});

module.exports = { sendSMSfromShablon };
