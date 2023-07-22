const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { keyboards } = require("../lib/keyboards");
const { messages } = require("../lib/messages");

const composer = new Composer();

composer.hears("➕Shablon yaratish", (ctx) => {});

bot.use(composer);
