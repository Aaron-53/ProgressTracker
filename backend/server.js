const app = require("./config/app");
const connectDB = require("./config/mongoose");
const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
