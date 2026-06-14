const mongoose = require('mongoose');

const pasteSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true 
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'plaintext'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    expires: 0

}});

const Paste = mongoose.model('Paste', pasteSchema);

module.exports = Paste;