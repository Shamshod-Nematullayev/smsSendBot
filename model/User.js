const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  data: Object,
  tarif: {
    type: Object,
    default: {
      type: "donalab",
      expired: null,
      activ: false,
      sms_login: "",
      sms_password: "",
    },
  },
  balance: {
    type: Number,
    default: 0,
  },
  oylik_harajat: {
    type: Number,
    default: 0,
  },
  eskiz: Object,
  admin: Boolean,
});

module.exports.User = mongoose.model("user", schema);
