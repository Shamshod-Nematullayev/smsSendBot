const { connectDB } = require("./config/connectDB");

require("dotenv").config();

// connect db
connectDB();
require("./middleware/useScenes");
require("./actions");
