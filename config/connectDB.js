const { default: mongoose } = require("mongoose");

const connectDB = () =>
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`DB connected`);
    })
    .catch((err) => {
      throw err;
    });

module.exports = { connectDB };
