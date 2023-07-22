const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      max: 15,
      required: true,
    },
    text: {
      required: true,
      type: String,
      min: 15,
    },
    user_id: {
      required: true,
      type: Number,
    },
    variables: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports.Shablon = mongoose.model("shablon", schema);
