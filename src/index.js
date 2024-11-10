require("dotenv").config({ path: "./env" });

const connectDB = require("./config/db"); // Database connection module to connect to MongoDB
const app = require("./app");

// Connect to the database (MongoDB)
connectDB()
  .then(() => {
    // Define the port to listen on (default to 5000 or use the PORT from environment variables)
    app.listen(process.env.PORT || 8000, () => {
      // Start the server and listen on the defined port
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
