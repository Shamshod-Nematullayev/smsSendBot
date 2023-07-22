const { Markup } = require("telegraf");

module.exports.keyboards = {
  menuKeyboard: Markup.keyboard([
    ["✉️ SMS yuborish", "📓 Shablonlar"],
    ["⚙️ Sozlamalar", "📃 Yo'riqnoma"],
  ]).resize(),
  shablonsPanel: Markup.keyboard([
    ["➕Shablon yaratish"],
    ["📂Shablonlarni ko'rish"],
  ]).resize(),
  exitBtn: "⬅️Chiqish",
  exitKey: Markup.keyboard(["⬅️Chiqish"]),
};
