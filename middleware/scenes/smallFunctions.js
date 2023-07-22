const { keyboards } = require("../../lib/keyboards");

module.exports.isExit = (ctx) => {
  try {
    if (ctx.message.text == keyboards.exitBtn) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};
