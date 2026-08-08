const express = require("express");
const mongoose = require("mongoose");
const pasteRoute = require("./routes/pasteRoute")
const {pasteHandle} = require("./controllers/pasteLog")
const {getPaste} = require("./controllers/getPaste")
const getPasteRoute = require("./routes/getPasteRoute")
const paste = require("./model/pasteDB")
const path = require("path");
const viewRoutes = require("./routes/viewRoute");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));



mongoose
  .connect(process.env.MONGO_URI)
  .then(console.log("mongodb connected"))
  .catch((err) => console.log(err));



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", pasteRoute);
app.use("/api", getPasteRoute);
app.use("/", viewRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`server started`);
});
