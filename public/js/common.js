/**
 * FocusTube - Common Utilities & Storage Management
 * Written in clean, vanilla JavaScript for college project demonstration.
 * Handles user state, localStorage, backend synchronization, study history, and audio synthesis.
 */

// Key constants for localStorage
const STORAGE_KEYS = {
  USER: "focustube_user",
  NOTES: "focustube_notes",
  PLAYLISTS: "focustube_playlists",
  HISTORY: "focustube_history",
  API_KEY: "focustube_youtube_api_key",
  POMODORO: "focustube_pomodoro_count"
};

// ===================================================
// 1. USER AUTHENTICATION STATE
// ===================================================
function getCurrentUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
  updateNavbarAuthStatus();
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  updateNavbarAuthStatus();
  alert("You have been logged out successfully.");
  window.location.href = "login.html";
}

function updateNavbarAuthStatus() {
  const authNav = document.getElementById("nav-auth-item");
  if (!authNav) return;

  const user = getCurrentUser();
  if (user) {
    authNav.innerHTML = `
      <span style="font-weight: bold; color: #0056b3;">${escapeHtml(user.name)}</span>
      <button onclick="logoutUser()" class="btn btn-secondary btn-sm" style="margin-left: 8px;">Logout</button>
    `;
  } else {
    authNav.innerHTML = `<a href="login.html" class="btn btn-sm">Login</a>`;
  }
}

// ===================================================
// 2. RECENTLY WATCHED / STUDY HISTORY TRACKER
// ===================================================
function recordRecentlyWatched(item) {
  if (!item || (!item.youtubeId && !item.playlistId)) return;

  let history = getRecentlyWatched();
  
  // Remove duplicate if already present
  const idToMatch = item.youtubeId || item.playlistId;
  history = history.filter(h => (h.youtubeId || h.playlistId) !== idToMatch);

  // Add to top of list with current timestamp
  history.unshift({
    youtubeId: item.youtubeId || "",
    playlistId: item.playlistId || "",
    title: item.title || "Engineering Lecture",
    channel: item.channel || "Educational Channel",
    category: item.category || "Engineering",
    watchedAt: new Date().toLocaleDateString()
  });

  // Limit history to top 8 items
  if (history.length > 8) {
    history = history.slice(0, 8);
  }

  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function getRecentlyWatched() {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function clearRecentlyWatched() {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// ===================================================
// 3. STUDY NOTES WITH TWO-WAY SERVER/MONGODB SYNC
// ===================================================
function getLocalNotes() {
  const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
  if (!notes) {
    // Seed with two helpful starter notes for college project demo
    const defaultNotes = [
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
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(defaultNotes));
    return defaultNotes;
  }
  try {
    return JSON.parse(notes);
  } catch (e) {
    return [];
  }
}

function saveLocalNote(note) {
  const notes = getLocalNotes();
  if (!note.id) {
    note.id = "note_" + Date.now();
  }
  if (!note.createdAt) {
    note.createdAt = new Date().toLocaleDateString();
  }

  const existingIndex = notes.findIndex(n => n.id === note.id);
  if (existingIndex >= 0) {
    notes[existingIndex] = note;
  } else {
    notes.unshift(note);
  }

  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

  // Asynchronous sync to Express backend (MongoDB)
  syncNoteToServer(note);

  return note;
}

function deleteLocalNote(noteId) {
  let notes = getLocalNotes();
  notes = notes.filter(n => n.id !== noteId);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

  // Asynchronous delete from Express backend
  deleteNoteFromServer(noteId);
}

// Two-way synchronization: Merges backend notes into localStorage
async function syncNotesWithBackend() {
  try {
    const res = await fetch("/api/notes");
    if (res.ok) {
      const serverNotes = await res.json();
      if (Array.isArray(serverNotes) && serverNotes.length > 0) {
        const localNotes = getLocalNotes();
        const mergedMap = new Map();

        // Server notes first
        serverNotes.forEach(n => mergedMap.set(n.id, n));
        // Local notes override if modified
        localNotes.forEach(n => mergedMap.set(n.id, n));

        const merged = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(merged));
        return { success: true, notes: merged };
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }
  return { success: false, notes: getLocalNotes() };
}

async function syncNoteToServer(note) {
  try {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
    });
  } catch (err) {
    // Graceful offline fallback
  }
}

async function deleteNoteFromServer(noteId) {
  try {
    await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
  } catch (err) {
    // Graceful offline fallback
  }
}

// ===================================================
// 4. PLAYLISTS MANAGEMENT
// ===================================================
function getLocalPlaylists() {
  const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
  if (!playlists) {
    const defaultPlaylists = [
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
      },
      {
        id: "pl-2",
        name: "Web Dev & Full Stack Projects",
        videos: [
          {
            youtubeId: "Oe421EPjeBE",
            title: "Node.js and Express.js Full Course",
            channel: "freeCodeCamp.org"
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(defaultPlaylists));
    return defaultPlaylists;
  }
  try {
    return JSON.parse(playlists);
  } catch (e) {
    return [];
  }
}

function saveLocalPlaylists(playlists) {
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
}

function addVideoToPlaylist(playlistId, video) {
  const playlists = getLocalPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return false;

  const exists = playlist.videos.some(v => v.youtubeId === video.youtubeId);
  if (exists) {
    alert("This lecture is already saved in '" + playlist.name + "'!");
    return false;
  }

  playlist.videos.push({
    youtubeId: video.youtubeId,
    title: video.title,
    channel: video.channel || "Educational Channel"
  });

  saveLocalPlaylists(playlists);
  alert("Added to study playlist: " + playlist.name);
  return true;
}

function promptAddToPlaylist(youtubeId, title, channel) {
  const playlists = getLocalPlaylists();
  if (playlists.length === 0) {
    alert("No study playlists found. Please go to the Playlists page to create one!");
    return;
  }

  let optionsText = "Select a playlist to add this lecture:\n\n";
  playlists.forEach((p, index) => {
    optionsText += `${index + 1}. ${p.name} (${p.videos.length} videos)\n`;
  });
  optionsText += "\nEnter the playlist number (e.g. 1):";

  const choice = prompt(optionsText);
  if (!choice) return;

  const num = parseInt(choice, 10);
  if (isNaN(num) || num < 1 || num > playlists.length) {
    alert("Invalid playlist number selected.");
    return;
  }

  const selectedPlaylist = playlists[num - 1];
  addVideoToPlaylist(selectedPlaylist.id, { youtubeId, title, channel });
}

// ===================================================
// 5. AUDIO SYNTHESIZER & HELPERS
// ===================================================

// Beep audio synthesizer for Pomodoro Timer (no external audio file required)
function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 tone
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log("Web Audio API beep alert not supported on this browser.");
  }
}

// Convert MM:SS or HH:MM:SS string to total seconds
function timeStringToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const parts = timeStr.trim().split(":").map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function escapeJs(str) {
  if (!str) return "";
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Initialize navbar status on DOM load
document.addEventListener("DOMContentLoaded", () => {
  updateNavbarAuthStatus();
});
