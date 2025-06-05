const mongoose = require("mongoose");
const app = require("./app");

const PORT = 3000;

// Replace with your actual Mongo URI
mongoose
  .connect("mongodb://akshay:root@192.168.18.48:27017/?tls=false")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB connection failed:", err));

