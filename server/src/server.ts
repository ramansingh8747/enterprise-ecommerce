import dotenv from "dotenv";
<<<<<<< HEAD
dotenv.config();

import app from "./app";
import connectDB from "./database/db";

//console.log("SMS_PROVIDER =", process.env.SMS_PROVIDER)
=======
import app from "./app";
import connectDB from "./database/db";

dotenv.config();
>>>>>>> e39b6efb4dfe21f2cbc24576fb7b5badc032a18e

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

startServer();