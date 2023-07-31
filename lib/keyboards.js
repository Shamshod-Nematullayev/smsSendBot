const { Markup } = require("telegraf");

module.exports.keyboards = {
  menuKeyboard: Markup.keyboard([
    ["✉️ SMS yuborish", "📓 Shablonlar"],
    ["👤 Shaxsiy kabinet", "📃 Yo'riqnoma"],
  ]).resize(),
  shablonsPanel: Markup.keyboard([
    ["➕Shablon yaratish"],
    ["📂Shablonlarni ko'rish"],
    ["⬅️Chiqish"],
  ]).resize(),
  exitBtn: "⬅️Chiqish",
  exitKey: Markup.keyboard(["⬅️Chiqish"]).resize(),
  chooseTarif: Markup.keyboard([[`EKANOM`, `BIZNES`], ["⬅️Chiqish"]]).resize(),
};
