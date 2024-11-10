// Import mongoose for MongoDB connection
const mongoose = require('mongoose');

// Function to establish connection to MongoDB
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message with the MongoDB host to confirm the connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Handle different types of errors with specific messages
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      // This error occurs when the MongoDB server can't be selected
      console.error('MongoDB server selection error:', error.message);
    }  else {
      // For other types of errors
      console.error(`Error: ${error.message}`);
    }
    
    // Exit the process with failure status to ensure the app stops in case of a connection failure
    process.exit(1);  // Exits the process with an error code (1)
  }
};

// Export the connectDB function for use in other parts of the application (e.g., server.js or app.js)
module.exports = connectDB;
