const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
});

module.exports.Admin = mongoose.model("admin", schema);
