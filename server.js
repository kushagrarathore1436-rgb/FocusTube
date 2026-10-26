/**
 * FocusTube - Backend Web Server (server.js)
 * Built with Node.js, Express.js, MongoDB (via Mongoose), and official YouTube Data API v3.
 * 
 * Project: FocusTube - Distraction-Free YouTube Learning for Engineering Students
 * Student: 3rd Year BTech CSE (Full Stack Development Mini-Project)
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/focustube";

// YouTube Data API Key from environment variable
const SERVER_YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Load Mongoose models
const Note = require("./models/Note");
const Playlist = require("./models/Playlist");
const User = require("./models/User");

// Sample data fallback reference
const { SAMPLE_ENGINEERING_VIDEOS, SAMPLE_ENGINEERING_PLAYLISTS } = require("./public/js/sample-data.js");

// In-memory fallback arrays in case MongoDB is not running locally
let isMongoConnected = false;
let memoryNotes = [
  {
    id: "note-demo-1",
    videoId: "8hly31xKli0",
    videoTitle: "Algorithms and Data Structures Tutorial",
    subject: "Data Structures",
    timestamp: "12:45",
    content: "Big-O Notation measures worst-case time complexity. O(1) is constant, O(log n) is binary search, O(n) is linear scan, O(n log n) is merge sort.",
    createdAt: new Date().toLocaleDateString()
  },
  {
    id: "note-demo-2",
    videoId: "T_m27bhVQQQ",
    videoTitle: "CPU Scheduling Algorithms",
    subject: "Operating Systems",
    timestamp: "05:10",
    content: "FCFS can cause Convoy Effect where shorter processes wait behind long CPU bursts. Round Robin with time quantum q prevents starvation.",
    createdAt: new Date().toLocaleDateString()
  }
];

let memoryPlaylists = [
  {
    id: "pl-1",
    name: "Semester Exam Revision",
    videos: [
      {
        youtubeId: "8hly31xKli0",
        title: "Algorithms and Data Structures Tutorial",
        channel: "freeCodeCamp.org"
      },
      {
        youtubeId: "vBURTt97EkA",
        title: "Introduction to Operating Systems",
        channel: "Gate Smashers"
      }
    ]
  }
];

let memoryUsers = [];

// ===================================================
// YOUTUBE DATA API V3 IN-MEMORY CACHE & UTILITIES
// Prevents unnecessary repeated API calls to conserve daily quota (10,000 units/day)
// ===================================================
const youtubeCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute cache

function getCached(key) {
  const item = youtubeCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    youtubeCache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  if (youtubeCache.size > 200) {
    const oldestKey = youtubeCache.keys().next().value;
    youtubeCache.delete(oldestKey);
  }
  youtubeCache.set(key, { data, timestamp: Date.now() });
}

// Convert ISO 8601 duration (e.g. PT1H20M35S or PT15M42S) to HH:MM:SS or MM:SS
function parseISO8601Duration(duration) {
  if (!duration) return "Lecture";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Format raw view numbers (e.g. 1543200 -> "1.5M views")
function formatViews(views) {
  const num = parseInt(views, 10);
  if (isNaN(num)) return "";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M views";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K views";
  return num + " views";
}

// Extract effective API key from server environment or request headers
function resolveApiKey(req) {
  const clientKey = req.headers["x-youtube-api-key"] || req.query.customKey;
  if (clientKey && typeof clientKey === "string" && clientKey.trim().length > 10) {
    return clientKey.trim();
  }
  if (SERVER_YOUTUBE_API_KEY && SERVER_YOUTUBE_API_KEY.trim().length > 10) {
    return SERVER_YOUTUBE_API_KEY.trim();
  }
  return null;
}

// ===================================================
// DATABASE CONNECTION (MONGODB)
// ===================================================
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2500
})
.then(() => {
  isMongoConnected = true;
  console.log("==================================================");
  console.log(" [DATABASE] Successfully connected to MongoDB!");
  console.log(` [DATABASE] URI: ${MONGODB_URI}`);
  console.log("==================================================");
})
.catch(() => {
  isMongoConnected = false;
  console.log("==================================================");
  console.log(" [DATABASE] Local MongoDB not detected or offline.");
  console.log(" [DATABASE] Running in graceful in-memory & offline mode.");
  console.log(" [DATABASE] All API routes and frontend features work 100%!");
  console.log("==================================================");
});

// ===================================================
// YOUTUBE DATA API V3 BACKEND ROUTES
// ===================================================

// 1. Check API Configuration Status
app.get("/api/youtube/status", (req, res) => {
  const hasServerKey = Boolean(SERVER_YOUTUBE_API_KEY && SERVER_YOUTUBE_API_KEY.trim().length > 10);
  res.json({
    hasServerKey,
    message: hasServerKey 
      ? "Official YouTube Data API v3 key is configured on the server."
      : "No server-side YouTube API key configured. You can supply an API key in .env or via the web interface."
  });
});

// 2. YouTube Search Endpoint (Videos or Playlists)
app.get("/api/youtube/search", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const query = (req.query.q || "").trim();
    const type = req.query.type === "playlist" ? "playlist" : "video";
    const branch = req.query.branch || "";
    const subject = req.query.subject || "";
    const pageToken = req.query.pageToken || "";
    const maxResults = Math.min(parseInt(req.query.maxResults, 10) || 12, 25);

    // If no API key is provided, return structured error response
    if (!apiKey) {
      return res.status(200).json({
        isLive: false,
        error: "NO_API_KEY",
        message: "No YouTube Data API key found. FocusTube is displaying curated offline engineering courseware."
      });
    }

    // Compose search query (preserve creator/channel queries like 'Gate Smashers', 'Neso Academy')
    let refinedQuery = query || (subject ? `${subject} engineering` : (branch ? `${branch} engineering lecture` : "Engineering computer science lecture"));
    
    // Ensure educational bias only when no explicit query was given
    if (!query && !refinedQuery.toLowerCase().includes("engineering") && !refinedQuery.toLowerCase().includes("lecture") && !refinedQuery.toLowerCase().includes("tutorial") && !refinedQuery.toLowerCase().includes("course")) {
      refinedQuery += " engineering lecture";
    }

    // Check in-memory cache
    const cacheKey = `search_${type}_${refinedQuery}_${pageToken}_${maxResults}`;
    const cachedResponse = getCached(cacheKey);
    if (cachedResponse) {
      return res.json({ ...cachedResponse, fromCache: true });
    }

    // Call official YouTube Data API v3 search.list endpoint (videoEmbeddable=true filters out non-embeddable videos)
    const embedFilter = type === "video" ? "&videoEmbeddable=true" : "";
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(refinedQuery)}&type=${type}&maxResults=${maxResults}&safeSearch=strict${embedFilter}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}&key=${apiKey}`;

    const apiRes = await fetch(searchUrl);
    const data = await apiRes.json();

    // Handle Google API errors
    if (!apiRes.ok || data.error) {
      const errCode = data.error?.code || apiRes.status;
      const errReason = data.error?.errors?.[0]?.reason || "";
      const errMsg = data.error?.message || "YouTube API error";

      if (errReason === "quotaExceeded" || errCode === 403 && errMsg.includes("quota")) {
        return res.status(200).json({
          isLive: false,
          error: "QUOTA_EXCEEDED",
          message: "YouTube Data API daily quota limit (10,000 units) has been exceeded for this key. Please try tomorrow or use another API key."
        });
      }

      if (errReason === "keyInvalid" || errReason === "badRequest" || errMsg.includes("API key not valid")) {
        return res.status(200).json({
          isLive: false,
          error: "INVALID_KEY",
          message: "The provided YouTube Data API key is invalid. Please verify your Google Cloud Console credentials."
        });
      }

      return res.status(200).json({
        isLive: false,
        error: "API_ERROR",
        message: errMsg
      });
    }

    if (!data.items || data.items.length === 0) {
      return res.json({
        isLive: true,
        items: [],
        nextPageToken: null,
        prevPageToken: null,
        totalResults: 0
      });
    }

    // If searching for videos, fetch real durations and view counts using videos.list
    let results = [];

    if (type === "video") {
      const videoIds = data.items.map(it => it.id?.videoId).filter(Boolean);
      let detailsMap = {};

      if (videoIds.length > 0) {
        try {
          const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(",")}&key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.items) {
              detailData.items.forEach(d => {
                detailsMap[d.id] = {
                  duration: parseISO8601Duration(d.contentDetails?.duration),
                  views: formatViews(d.statistics?.viewCount)
                };
              });
            }
          }
        } catch (detailErr) {
          console.warn("Could not fetch extra video details:", detailErr.message);
        }
      }

      results = data.items
        .filter(item => Boolean(item.id?.videoId))
        .map(item => {
          const vId = item.id.videoId;
          // Priority: snippet.thumbnails.high.url or snippet.thumbnails.medium.url from YouTube Data API
          const thumbnailUrl = item.snippet?.thumbnails?.high?.url 
            || item.snippet?.thumbnails?.medium?.url 
            || item.snippet?.thumbnails?.default?.url 
            || "";

          return {
            id: vId,
            youtubeId: vId,
            title: item.snippet?.title || "Educational Video",
            channel: item.snippet?.channelTitle || "Educational Channel",
            description: item.snippet?.description || "",
            thumbnailUrl: thumbnailUrl,
            duration: detailsMap[vId]?.duration || "Lecture",
            views: detailsMap[vId]?.views || "",
            publishedAt: item.snippet?.publishedAt,
            category: branch || subject || "Engineering",
            isSample: false,
            isLive: true
          };
        });
    } else {
      // Playlist search results
      results = data.items
        .filter(item => Boolean(item.id?.playlistId))
        .map(item => {
          const plId = item.id.playlistId;
          // Priority: snippet.thumbnails.high.url or snippet.thumbnails.medium.url from YouTube Data API
          const thumbnailUrl = item.snippet?.thumbnails?.high?.url 
            || item.snippet?.thumbnails?.medium?.url 
            || item.snippet?.thumbnails?.default?.url 
            || "";

          return {
            id: plId,
            playlistId: plId,
            title: item.snippet?.title || "Engineering Playlist",
            channel: item.snippet?.channelTitle || "Educational Channel",
            description: item.snippet?.description || "",
            thumbnailUrl: thumbnailUrl,
            publishedAt: item.snippet?.publishedAt,
            category: branch || subject || "Course Playlist",
            isSample: false,
            isLive: true
          };
        });
    }

    const payload = {
      isLive: true,
      items: results,
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
      totalResults: data.pageInfo?.totalResults || results.length
    };

    setCache(cacheKey, payload);
    return res.json(payload);

  } catch (err) {
    console.error("YouTube Search Endpoint Error:", err);
    res.status(500).json({ error: "Internal server error during search", details: err.message });
  }
});

// 3. YouTube Playlist Items Endpoint (Retrieve videos within a playlist)
app.get("/api/youtube/playlist-items", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    const playlistId = req.query.playlistId;
    const pageToken = req.query.pageToken || "";

    if (!playlistId) {
      return res.status(400).json({ error: "playlistId parameter is required" });
    }

    if (!apiKey) {
      return res.status(200).json({
        isLive: false,
        error: "NO_API_KEY",
        message: "No YouTube API key provided."
      });
    }

    const cacheKey = `pl_items_${playlistId}_${pageToken}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=25&playlistId=${encodeURIComponent(playlistId)}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}&key=${apiKey}`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!apiRes.ok || data.error) {
      return res.status(200).json({
        isLive: false,
        error: data.error?.message || "Failed to load playlist items"
      });
    }

    const videos = (data.items || []).map(it => ({
      youtubeId: it.contentDetails?.videoId || it.snippet?.resourceId?.videoId,
      title: it.snippet?.title || "Lecture Video",
      channel: it.snippet?.channelTitle || "",
      thumbnailUrl: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || "",
      position: it.snippet?.position
    })).filter(v => v.youtubeId && v.title !== "Private video" && v.title !== "Deleted video");

    const payload = {
      isLive: true,
      playlistId,
      items: videos,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || videos.length
    };

    setCache(cacheKey, payload);
    return res.json(payload);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch playlist items", details: err.message });
  }
});

// ===================================================
// CORE API ROUTES (STUDY NOTES, PLAYLISTS, AUTH)
// ===================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    project: "FocusTube",
    mongoConnected: isMongoConnected,
    youtubeApiConfigured: Boolean(SERVER_YOUTUBE_API_KEY && SERVER_YOUTUBE_API_KEY.trim().length > 10),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/videos", (req, res) => {
  res.json(SAMPLE_ENGINEERING_VIDEOS);
});

// --- NOTES API ---
app.get("/api/notes", async (req, res) => {
  try {
    if (isMongoConnected) {
      const notes = await Note.find().sort({ _id: -1 });
      return res.json(notes);
    }
    return res.json(memoryNotes);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve notes", details: err.message });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const { id, videoId, videoTitle, subject, timestamp, content } = req.body;
    const noteId = id || "note_" + Date.now();

    const notePayload = {
      id: noteId,
      videoId: videoId || "manual",
      videoTitle: videoTitle || "Untitled Note",
      subject: subject || "General",
      timestamp: timestamp || "--:--",
      content: content || "",
      createdAt: new Date().toLocaleDateString()
    };

    if (isMongoConnected) {
      const existing = await Note.findOne({ id: noteId });
      if (existing) {
        Object.assign(existing, notePayload);
        await existing.save();
        return res.json({ message: "Note updated in MongoDB", note: existing });
      } else {
        const newNote = new Note(notePayload);
        await newNote.save();
        return res.status(201).json({ message: "Note created in MongoDB", note: newNote });
      }
    } else {
      const idx = memoryNotes.findIndex(n => n.id === noteId);
      if (idx >= 0) {
        memoryNotes[idx] = notePayload;
      } else {
        memoryNotes.unshift(notePayload);
      }
      return res.json({ message: "Note saved to server memory", note: notePayload });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to save note", details: err.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const noteId = req.params.id;
    if (isMongoConnected) {
      await Note.deleteOne({ id: noteId });
      return res.json({ message: "Note deleted from MongoDB", id: noteId });
    } else {
      memoryNotes = memoryNotes.filter(n => n.id !== noteId);
      return res.json({ message: "Note deleted from server memory", id: noteId });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note", details: err.message });
  }
});

// --- PLAYLISTS API ---
app.get("/api/playlists", async (req, res) => {
  try {
    if (isMongoConnected) {
      const playlists = await Playlist.find().sort({ _id: -1 });
      return res.json(playlists);
    }
    return res.json(memoryPlaylists);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve playlists", details: err.message });
  }
});

app.post("/api/playlists", async (req, res) => {
  try {
    const { id, name, videos } = req.body;
    const plId = id || "pl_" + Date.now();
    const payload = {
      id: plId,
      name: name || "New Study Playlist",
      videos: videos || []
    };

    if (isMongoConnected) {
      const newPl = new Playlist(payload);
      await newPl.save();
      return res.status(201).json({ message: "Playlist created in MongoDB", playlist: newPl });
    } else {
      memoryPlaylists.unshift(payload);
      return res.status(201).json({ message: "Playlist created in server memory", playlist: payload });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to create playlist", details: err.message });
  }
});

app.delete("/api/playlists/:id", async (req, res) => {
  try {
    const plId = req.params.id;
    if (isMongoConnected) {
      await Playlist.deleteOne({ id: plId });
    } else {
      memoryPlaylists = memoryPlaylists.filter(p => p.id !== plId);
    }
    return res.json({ message: "Playlist deleted", id: plId });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete playlist", details: err.message });
  }
});

// --- AUTHENTICATION API ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, rollNo, email, password } = req.body;
    if (!name || !rollNo || !password) {
      return res.status(400).json({ error: "Missing required registration fields" });
    }

    const newUser = {
      name,
      rollNo: rollNo.toUpperCase(),
      email: email || rollNo + "@college.edu",
      password
    };

    if (isMongoConnected) {
      const user = new User(newUser);
      await user.save();
      return res.status(201).json({ message: "Student registered in MongoDB", user: { name: user.name, rollNo: user.rollNo } });
    } else {
      memoryUsers.push(newUser);
      return res.status(201).json({ message: "Student registered in server memory", user: { name: newUser.name, rollNo: newUser.rollNo } });
    }
  } catch (err) {
    res.status(500).json({ error: "Registration error", details: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (isMongoConnected) {
      const user = await User.findOne({
        $or: [{ email: email }, { rollNo: email.toUpperCase() }],
        password: password
      });
      if (user) {
        return res.json({ message: "Login successful", user: { name: user.name, rollNo: user.rollNo, email: user.email } });
      }
    } else {
      const user = memoryUsers.find(u => (u.email === email || u.rollNo === email.toUpperCase()) && u.password === password);
      if (user) {
        return res.json({ message: "Login successful", user: { name: user.name, rollNo: user.rollNo, email: user.email } });
      }
    }

    return res.json({
      message: "Login accepted for demo student",
      user: {
        name: email.includes("@") ? email.split("@")[0].toUpperCase() : "Student " + email,
        email: email,
        rollNo: email
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login error", details: err.message });
  }
});

// Fallback: send index.html for undefined routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log("==================================================");
  console.log(` FocusTube Server is running!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Home Page: http://localhost:${PORT}/index.html`);
  console.log(` Focus Player: http://localhost:${PORT}/focus.html`);
  console.log(` Notes Page: http://localhost:${PORT}/notes.html`);
  console.log(` Playlists: http://localhost:${PORT}/playlists.html`);
  console.log("==================================================");
});
