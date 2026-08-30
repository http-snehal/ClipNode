const Paste = require("../model/pasteDB");
const { customAlphabet } = require("nanoid");

const generateShortId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
);

const pasteHandle = async (req, res) => {
  try {
    const { content, language, expiry, isLive } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const shortId = generateShortId();
    let expirationDate = null;

    // Calculate expiration based on user selection (default: 24h)
    const selectedExpiry = expiry || "24h";
    const now = Date.now();

    switch (selectedExpiry) {
      case "1h":
        expirationDate = new Date(now + 1 * 60 * 60 * 1000);
        break;
      case "24h":
        expirationDate = new Date(now + 24 * 60 * 60 * 1000);
        break;
      case "7d":
        expirationDate = new Date(now + 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        expirationDate = new Date(now + 30 * 24 * 60 * 60 * 1000);
        break;
      case "never":
        expirationDate = null;
        break;
      default:
        expirationDate = new Date(now + 24 * 60 * 60 * 1000);
    }

    const newPaste = await Paste.create({
      shortId,
      content,
      language: language || "javascript",
      userId: req.session.userId || null,
      isLive: Boolean(isLive),
      ...(expirationDate && { expiresAt: expirationDate }),
    });

    return res.status(201).json(newPaste);
  } catch (error) {
    console.error("Error creating paste:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  pasteHandle,
};
