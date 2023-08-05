const { Scenes, Markup } = require("telegraf");
const { keyboards } = require("../../lib/keyboards");
const { messages } = require("../../lib/messages");
const { Shablon } = require("../../model/Shablon");
const { isExit, smscount } = require("./smallFunctions");
const { toExcel } = require("to-excel");
const excelToJson = require("convert-excel-to-json");
const https = require("https");
const { bot } = require("../../core/bot");
const fs = require("fs");
const { User } = require("../../model/User");
const { Eskiz } = require("../../helper/eskiz");

const sendSMS = new Scenes.WizardScene(
  "SENDING_SMS",
  async (ctx) => {
    try {
      // ---------------Shablonlardan biri tanlanganida
      // import tegmasi borilganida
      if (ctx.callbackQuery) {
        const [key, value] = ctx.callbackQuery.data.split("_");
        if (key == "sendsms") {
          const shablon = await Shablon.findById(value);
          ctx.deleteMessage();
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
              ctx.wizard.state.phone_numbers = [];
              result.input.forEach(async (row, i) => {
                if (i !== 0) {
                  let messageText = ``;
                  if (row.A.toString().length !== 9 || isNaN(row.A)) {
                    return ctx.reply(
                      `${i + 2}-qatordagi telefon to'g'ri formatda kiritilmagan`
                    );
                  }
                  let text = `+998${row.A} ga \n ${shablon.text}`;
                  let textForSend = shablon.text;
                  for (let j = 0; j < shablon.variables.length; j++) {
                    const variable = shablon.variables[j];
                    let rgx = new RegExp("(\\[" + variable + "*\\])", "g");
                    messageText = text.replace(
                      rgx,
                      row[Object.keys(row)[j + 1]]
                    );
                    text = text.replace(rgx, row[Object.keys(row)[j + 1]]);
                    textForSend = textForSend.replace(
                      rgx,
                      row[Object.keys(row)[j + 1]]
                    );
                  }
                  ctx.wizard.state.phone_numbers.push({
                    phone: `998${row.A}`,
                    text: textForSend,
                    prefix: row.A.toString().slice(0, 2),
                  });
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
              const fileSended = await ctx.replyWithDocument(
                {
                  source: filename,
                  filename: filename,
                },
                Markup.inlineKeyboard([
                  Markup.button.callback("Tasdiqlash", "confirm"),
                ])
              );
              ctx.wizard.state.text_file_id = fileSended.document.file_id;

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
  },
  async (ctx) => {
    try {
      if (isExit(ctx)) {
        return ctx.scene.leave();
      }

      if (ctx.callbackQuery.data === "confirm") {
        const user = await User.findOne({ user_id: ctx.from.id });

        const eskiz = new Eskiz(user.eskiz);
        const ucell = [93, 94, 50];
        if (user.tarif.type == "BIZNES") {
          let summ = 0;
          for (let i = 0; i < ctx.wizard.state.phone_numbers.length; i++) {
            const acc = ctx.wizard.state.phone_numbers[i];
            console.log(acc);
            if (smscount(acc.text) == 10) {
              return ctx.reply(`${i + 1} qatordagi xabar matni juda katta`);
            }
            if (ucell.includes(parseInt(acc.prefix))) {
              summ += 115;
            } else {
              summ += 50;
            }
            const balance = await eskiz.getBalance();
            console.log(balance);
          }
        }
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
