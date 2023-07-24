const { Scenes, Markup } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { Shablon } = require("../../model/Shablon");
const { isExit } = require("./smallFunctions");
const { toExcel } = require("to-excel");
const excelToJson = require("convert-excel-to-json");
const https = require("https");
const { bot } = require("../../core/bot");

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
            await require("fs").writeFileSync("input.xls", xlsxContent);
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
      const shablons = await Shablon.find();
      let found = false;
      let template;
      if (isExit(ctx)) {
        return ctx.scene.leave();
      }
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
      if (ctx.message.document.mime_type === "application/vnd.ms-excel") {
        const fileLink = await ctx.telegram.getFileLink(
          ctx.message.document.file_id
        );
        const excelFile = require("fs").createWriteStream("./input.xls");
        https.get(fileLink.href, (res) => {
          ctx.reply(messages.pleaseWait);
          res.pipe(excelFile);
          excelFile.on("finish", async (cb) => {
            excelFile.close(cb);
            const result = await excelToJson({
              sourceFile: "input.xls",
            });
            if (result.input) {
              const shablon = ctx.wizard.state.shablon;
              result.input.forEach((row, i) => {
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
                  }
                  ctx.reply(messageText);
                }
              });
            } else {
              ctx.reply(
                "Excel fileda asosiy input listi mavjud emas. Qo'llanmaga qarang"
              );
            }
            console.log(result);
          });
        });
      } else {
        ctx.reply("Bu excel file emas");
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
  ctx.reply(
    "Jo'natmoqchi bo'lgan shabloningizni tanlang!",
    Markup.keyboard(buttons).resize()
  );
});
sendSMS.leave((ctx) => {
  ctx.reply(messages.backMenu, keyboards.menuKeyboard);
});

module.exports = { sendSMS };
