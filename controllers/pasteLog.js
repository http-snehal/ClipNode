const Paste = require("../model/pasteDB");
const { customAlphabet } = require("nanoid");

const generateShortId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
);

const pasteHandle = async (req, res) => {
  try {
    const { content , language} = req.body;

    if (!content) {
      return res.status(400).json({ error: "content is required" });
    }

    const shortId = generateShortId();
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newPaste = await Paste.create({
      shortId,
      content,
       language: language || 'javascript',
      expiresAt: expirationDate,
    });

    return res.status(201).json(newPaste);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  pasteHandle,
};
