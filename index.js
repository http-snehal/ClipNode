const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { handleConnection, startAutoSaveInterval, startCleanupInterval } = require("./services/yjsServer");
require("dotenv").config();

const pasteRoute = require("./routes/pasteRoute");
const getPasteRoute = require("./routes/getPasteRoute");
const viewRoutes = require("./routes/viewRoute");
const authRoute = require("./routes/authRoute");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Database connection
async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/clipnode";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB connected");
  } catch (err) {
    console.log("Local MongoDB not reachable, starting MongoMemoryServer...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoMemoryServer:", mongoUri);
    } catch (memErr) {
      console.error("Failed to start MongoMemoryServer:", memErr);
    }
  }
}

connectDB();

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

// WebSocket Upgrade Handling for /live/:shortId
server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const match = pathname.match(/^\/live\/([a-zA-Z0-9_-]+)$/);

  if (match) {
    const shortId = match[1];
    wss.handleUpgrade(request, socket, head, (ws) => {
      handleConnection(ws, request, shortId);
    });
  } else {
    socket.destroy();
  }
});

// Start background timers for auto-save and TTL cleanup
startAutoSaveInterval(5000);
startCleanupInterval(60000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`server started with WebSocket live collaboration support`);
});
