/**
 * FocusTube - Mongoose Schema for Playlists
 * Model for MongoDB collection 'playlists'
 */

const mongoose = require("mongoose");

const playlistVideoSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    default: "Educational Channel"
  }
});

const playlistSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  videos: [playlistVideoSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Playlist", playlistSchema);
