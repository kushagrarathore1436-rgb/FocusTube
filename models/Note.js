/**
 * FocusTube - Mongoose Schema for Study Notes
 * Model for MongoDB collection 'notes'
 */

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  videoId: {
    type: String,
    default: "manual"
  },
  videoTitle: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: "General"
  },
  timestamp: {
    type: String,
    default: "--:--"
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: () => new Date().toLocaleDateString()
  }
});

module.exports = mongoose.model("Note", noteSchema);
