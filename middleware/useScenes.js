const { Scenes } = require("telegraf");
const { bot } = require("../core/bot");
const LocalSession = require("telegraf-session-local");
const { createShablon } = require("./scenes/createShablon");
const { sendSMS } = require("./scenes/sendSMS");
const stage = new Scenes.Stage([createShablon, sendSMS]);

bot.use(new LocalSession({ database: "./session.json" }).middleware());
bot.use(stage.middleware());
