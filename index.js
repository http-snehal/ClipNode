const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const pasteRoute = require("./routes/pasteRoute");
const getPasteRoute = require("./routes/getPasteRoute");
const path = require("path");
const viewRoutes = require("./routes/viewRoute");
const { handleConnection, startAutoSaveInterval, startCleanupInterval } = require("./services/yjsServer");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", pasteRoute);
app.use("/api", getPasteRoute);
app.use("/", viewRoutes);

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
