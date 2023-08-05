const { keyboards } = require("../../lib/keyboards");

module.exports.isExit = (ctx) => {
  try {
    if (ctx.message?.text == keyboards.exitBtn) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.smscount = (text) => {
  let str = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789! #%.,:;?/()+-&^?{}[]<>/|@#$%^+=~*_'()"`;
  let isKiril = false;
  for (let i = 0; i < text.length; i++) {
    let match = false;
    for (let j = 0; j < str.length; j++) {
      if (text[i] == str[j]) {
        match = true;
      }
    }
    if (!match) {
      isKiril = true;
    }
  }
  if (isKiril) {
    if (text.length <= 70) {
      return 1;
    } else if (text.length <= 134) {
      return 2;
    } else if (text.length <= 201) {
      return 3;
    } else if (text.length <= 268) {
      return 4;
    } else if (text.length <= 335) {
      return 5;
    } else if (text.length <= 402) {
      return 6;
    } else if (text.length <= 469) {
      return 7;
    } else if (text.length <= 536) {
      return 8;
    } else {
      return 10;
    }
  } else {
    if (text.length <= 160) {
      return 1;
    } else if (text.length <= 306) {
      return 2;
    } else if (text.length <= 459) {
      return 3;
    } else if (text.length <= 612) {
      return 4;
    } else if (text.length <= 765) {
      return 5;
    } else if (text.length <= 918) {
      return 6;
    } else if (text.length <= 1071) {
      return 7;
    } else if (text.length <= 1224) {
      return 8;
    } else {
      return 10;
    }
  }
};
