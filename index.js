const express = require("express");
const mongoose = require("mongoose");
const pasteRoute = require("./routes/pasteRoute")
const {pasteHandle} = require("./controllers/pasteLog")
const {getPaste} = require("./controllers/getPaste")
const getPasteRoute = require("./routes/getPasteRoute")
const paste = require("./model/pasteDB")
const path = require("path");
const viewRoutes = require("./routes/viewRoute");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));



mongoose
  .connect(`mongodb://127.0.0.1:27017/ClipNode`)
  .then(console.log("mongodb connected"))
  .catch((err) => console.log(err));



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", pasteRoute);
app.use("/api", getPasteRoute);
app.use("/", viewRoutes);


const PORT = 3333;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`server started`);
});
