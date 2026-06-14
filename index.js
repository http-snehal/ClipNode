const express = require("express");
const mongoose = require("mongoose");
const pasteRoute = require("./routes/pasteRoute")
const {pasteHandle} = require("./controllers/pasteLog")
const paste = require("./model/pasteDB")


mongoose
  .connect(`mongodb://127.0.0.1:27017/ClipNode`)
  .then(console.log("mongodb connected"))
  .catch((err) => console.log(err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", pasteRoute);

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`server started`);
});
