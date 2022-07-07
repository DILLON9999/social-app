// Require node modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();
const app = express();

// Connect to DB
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
)

// Middleware
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

// Routes
const userRoute = require('./routes/users')
app.use("/api/users", userRoute)
const authRoute = require('./routes/auth')
app.use("/api/auth", authRoute)
const postRoute = require('./routes/posts')
app.use("/api/posts", postRoute)

app.listen(8800, () => {
  console.log("Backend server is running!");
});