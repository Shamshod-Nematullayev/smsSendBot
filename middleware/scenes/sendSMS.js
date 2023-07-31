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

const sendSMS = new Scenes.WizardScene(
  "SENDING_SMS",
  async (ctx) => {
    try {
      // ---------------Shablonlardan biri tanlanganida
      if (ctx.callbackQuery) {
        const [key, value] = ctx.callbackQuery.data.split("_");
        if (key == "sendsms") {
          const shablon = await Shablon.findById(value);
          if (shablon) {
            ctx.wizard.state.shablon = shablon;
            const headers = [{ label: "Telefon", field: "phone" }];
            const data = [];
            shablon.variables.forEach((variable, i) => {
              headers.push({ label: variable, field: variable + i });
              if (i == 0) {
                data.push({
                  phone: "991872563",
                  [variable + i]: "example" + i,
                });
              }
            });
            let xlsxContent = toExcel.exportXLS(headers, data, "input");
            await fs.writeFileSync("input.xls", xlsxContent);
            ctx.replyWithDocument(
              { source: "input.xls" },
              {
                caption:
                  "Ushbu faylga o'zgaruvchi qiymatlarini joylashtirib botga qayta yuboring!",
              }
            );
            return ctx.wizard.next();
          } else {
            return ctx.reply(`Shablon topilmadi`, keyboards.exitKey);
          }
        }
      }

      // ------------- SHablonlardan biri tanlanayotganida
      if (isExit(ctx)) {
        return ctx.scene.leave();
      }
      const shablons = await Shablon.find();
      let found = false;
      let template;
      shablons.forEach((shablon) => {
        if (ctx.message.text == shablon.name) {
          found = true;
          template = shablon;
        }
      });
      if (!found) {
        ctx.reply(`Bunday shablon topilmadi 🤷🏻‍♂️`);
      } else {
        ctx.reply(
          `<b>${template.text}</b>\n <i> o'zgaruvchilarni kiritish uchun bosing 👇👇👇</i>`,
          {
            reply_markup: Markup.inlineKeyboard([
              Markup.button.callback("IMPORT", "sendsms_" + template._id),
            ]).reply_markup,
            parse_mode: "HTML",
          }
        );
      }
    } catch (error) {
      console.log(error);
      ctx.reply(messages.errorOccured, { parse_mode: "HTML" });
    }
  },
  async (ctx) => {
    // ---------------- EXCEL file qabul qilinayotgan payt
    try {
      // chiqish tugmasi tekshiruvi
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
              const shablon = ctx.wizard.state.shablon;
              let umumiyText = ``;

              result.input.forEach(async (row, i) => {
                if (i !== 0) {
                  let messageText = ``;
                  let text = `+998${row.A} ga \n ${shablon.text}`;
                  for (let j = 0; j < shablon.variables.length; j++) {
                    const variable = shablon.variables[j];
                    let rgx = new RegExp("(\\[" + variable + "*\\])", "g");
                    messageText = text.replace(
                      rgx,
                      row[Object.keys(row)[j + 1]]
                    );
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
  }
);
sendSMS.enter(async (ctx) => {
  const shablons = await Shablon.find();
  const buttons = [];
  shablons.forEach((shablon) => {
    buttons.push(shablon.name);
  });
  buttons.push(keyboards.exitBtn);
  ctx.reply(
    "Jo'natmoqchi bo'lgan shabloningizni tanlang!",
    Markup.keyboard(buttons).resize()
  );
});
sendSMS.leave((ctx) => {
  ctx.reply(messages.backMenu, keyboards.menuKeyboard);
});

module.exports = { sendSMS };
