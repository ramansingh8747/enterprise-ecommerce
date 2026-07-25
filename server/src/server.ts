import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./database/db";

//console.log("SMS_PROVIDER =", process.env.SMS_PROVIDER)

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();