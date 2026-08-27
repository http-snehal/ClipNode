const Y = require("yjs");
const syncProtocol = require("y-protocols/dist/sync.cjs");
const awarenessProtocol = require("y-protocols/dist/awareness.cjs");
const encoding = require("lib0/dist/encoding.cjs");
const decoding = require("lib0/dist/decoding.cjs");
const Paste = require("../model/pasteDB");

// Map storing active Yjs room instances: shortId -> WSSharedDoc
const docs = new Map();
// Set tracking dirty room names needing periodic DB auto-save
const dirtyDocs = new Set();

class WSSharedDoc extends Y.Doc {
  constructor(name) {
    super({ gc: true });
    this.name = name;
    this.conns = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);

    // Broadcast awareness updates to all connected sockets
    this.awareness.on("update", ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated, removed);
      if (origin !== null && this.conns.has(origin)) {
        const clientIds = this.conns.get(origin);
        added.forEach((id) => clientIds.add(id));
        removed.forEach((id) => clientIds.delete(id));
      }
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 1 /* messageAwareness */);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      for (const [conn] of this.conns) {
        send(this, conn, buff);
      }
    });

    // Broadcast document state updates to all connected sockets & mark dirty
    this.on("update", (update, origin) => {
      dirtyDocs.add(this.name);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 0 /* messageSync */);
      syncProtocol.writeUpdate(encoder, update);
      const buff = encoding.toUint8Array(encoder);
      for (const [conn] of this.conns) {
        send(this, conn, buff);
      }
    });
  }
}

function send(doc, ws, message) {
  if (ws.readyState !== 1 /* OPEN */) {
    closeConn(doc, ws);
    return;
  }
  try {
    ws.send(message, (err) => {
      if (err) closeConn(doc, ws);
    });
  } catch (e) {
    closeConn(doc, ws);
  }
}

function closeConn(doc, ws) {
  if (doc.conns.has(ws)) {
    const controlledIds = doc.conns.get(ws);
    doc.conns.delete(ws);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );
    if (doc.conns.size === 0) {
      persistDocToDB(doc.name, doc);
    }
  }
}

/**
 * Handle incoming WebSocket connection for live collaborative editing
 */
async function handleConnection(ws, req, shortId) {
  try {
    const paste = await Paste.findOne({ shortId });
    if (!paste || !paste.isLive) {
      ws.close(4004, "Paste not found or live collaboration is disabled.");
      return;
    }

    let doc = docs.get(shortId);
    let isNewDoc = false;

    if (!doc) {
      doc = new WSSharedDoc(shortId);
      docs.set(shortId, doc);
      isNewDoc = true;
    }

    doc.conns.set(ws, new Set());

    ws.on("message", (message) => {
      try {
        const encoder = encoding.createEncoder();
        const decoder = decoding.createDecoder(new Uint8Array(message));
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case 0: /* messageSync */ {
            encoding.writeVarUint(encoder, 0);
            syncProtocol.readSyncMessage(decoder, encoder, doc, ws);
            if (encoding.length(encoder) > 1) {
              send(doc, ws, encoding.toUint8Array(encoder));
            }
            break;
          }
          case 1: /* messageAwareness */ {
            awarenessProtocol.applyAwarenessUpdate(
              doc.awareness,
              decoding.readVarUint8Array(decoder),
              ws
            );
            break;
          }
        }
      } catch (err) {
        console.error(`[YjsServer] Error parsing WS message for ${shortId}:`, err);
      }
    });

    ws.on("close", () => {
      closeConn(doc, ws);
    });

    ws.on("error", () => {
      closeConn(doc, ws);
    });

    // Seed content from MongoDB if room was just created
    if (isNewDoc && paste.content) {
      const ytext = doc.getText("monaco");
      if (ytext.toString() === "") {
        ytext.insert(0, paste.content);
      }
    }

    // Send initial SyncStep1 to client
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, 0 /* messageSync */);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(doc, ws, encoding.toUint8Array(encoder));

    // Send current awareness states to client
    const awarenessStates = doc.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, 1 /* messageAwareness */);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          doc.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      send(doc, ws, encoding.toUint8Array(awarenessEncoder));
    }
  } catch (error) {
    console.error(`[YjsServer] Error handling WS connection for ${shortId}:`, error);
    ws.close(1011, "Internal server error");
  }
}

/**
 * Persist Y.Text content of a Y.Doc to MongoDB
 */
async function persistDocToDB(shortId, doc) {
  try {
    const ytext = doc.getText("monaco");
    const content = ytext.toString();
    await Paste.updateOne({ shortId }, { content });
    dirtyDocs.delete(shortId);
  } catch (err) {
    console.error(`[YjsServer] Error persisting snippet ${shortId} to DB:`, err);
  }
}

/**
 * Periodically save all edited (dirty) Yjs documents to MongoDB (every 5 seconds)
 */
function startAutoSaveInterval(intervalMs = 5000) {
  setInterval(async () => {
    if (dirtyDocs.size === 0) return;
    const shortIdsToSave = Array.from(dirtyDocs);
    for (const shortId of shortIdsToSave) {
      const doc = docs.get(shortId);
      if (doc) {
        await persistDocToDB(shortId, doc);
      } else {
        dirtyDocs.delete(shortId);
      }
    }
  }, intervalMs);
}

/**
 * Periodically clean up in-memory Yjs rooms for snippets that expired in MongoDB (every 60 seconds)
 */
function startCleanupInterval(intervalMs = 60000) {
  setInterval(async () => {
    const activeDocNames = Array.from(docs.keys());
    const now = new Date();
    for (const shortId of activeDocNames) {
      try {
        const paste = await Paste.findOne({ shortId });
        if (!paste || (paste.expiresAt && paste.expiresAt <= now)) {
          const doc = docs.get(shortId);
          if (doc) {
            for (const [conn] of doc.conns) {
              try {
                conn.close(4004, "Snippet expired");
              } catch (_) {}
            }
            doc.destroy();
            docs.delete(shortId);
            dirtyDocs.delete(shortId);
            console.log(`[YjsServer] Cleaned up expired room for snippet: ${shortId}`);
          }
        }
      } catch (err) {
        console.error(`[YjsServer] Error during TTL cleanup sweep for ${shortId}:`, err);
      }
    }
  }, intervalMs);
}

module.exports = {
  handleConnection,
  startAutoSaveInterval,
  startCleanupInterval,
};
