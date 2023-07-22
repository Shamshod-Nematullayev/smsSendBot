const { Scenes } = require("telegraf");
const { bot } = require("../core/bot");
const LocalSession = require("telegraf-session-local");
const stage = new Scenes.Stage([]);

bot.use(new LocalSession({ database: "./session.json" }).middleware());
bot.use(stage.middleware());
