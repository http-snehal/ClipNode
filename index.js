const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
require("dotenv").config();

const pasteRoute = require("./routes/pasteRoute");
const getPasteRoute = require("./routes/getPasteRoute");
const viewRoutes = require("./routes/viewRoute");
const authRoute = require("./routes/authRoute");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "clipnode-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Flash messages
app.use(flash());

// Expose user and flash data to all EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session && req.session.userId
    ? {
        id: req.session.userId,
        username: req.session.username,
      }
    : null;
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError   = req.flash('error');
  next();
});

// Routes
app.use('/', authRoute);
app.use('/api', pasteRoute);
app.use('/api', getPasteRoute);
app.use('/', viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Server started`);
});
