/**
 * FocusTube - Focus Player & Pomodoro Logic (player.js)
 * Implements official YouTube IFrame Player API for videos and playlists,
 * interactive clickable timestamp jumping, automatic timestamp capture,
 * and recently watched history logging.
 */

// Global State
let currentVideoId = "";
let currentPlaylistId = "";
let currentTitle = "";
let currentChannel = "";
let ytPlayer = null;
let isPlayerReady = false;

// Pomodoro Timer State
let timerInterval = null;
let timerMode = "study"; // "study" (25 mins) or "break" (5 mins)
let studyDuration = 25 * 60; // 1500 seconds
let breakDuration = 5 * 60;  // 300 seconds
let timeLeft = studyDuration;
let isTimerRunning = false;
let completedPomodoros = 0;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  parseUrlParameters();
  initPomodoroTimer();
  initQuickNotes();
  initCustomUrlLoader();
});

// ===================================================
// 1. URL PARSING & METADATA INITIALIZATION
// ===================================================
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  currentVideoId = urlParams.get("v") || "";
  currentPlaylistId = urlParams.get("list") || "";
  currentTitle = urlParams.get("title") || "";
  currentChannel = urlParams.get("channel") || "";
  const category = urlParams.get("category") || "Engineering Lecture";

  // Fallback to sample 1 if neither video nor playlist ID provided
  if (!currentVideoId && !currentPlaylistId) {
    currentVideoId = "8hly31xKli0";
  }

  // Lookup in sample video/playlist repository if metadata is missing
  if (currentVideoId && !currentTitle) {
    const sampleVid = typeof getSampleVideoById === "function" ? getSampleVideoById(currentVideoId) : null;
    if (sampleVid) {
      currentTitle = sampleVid.title;
      currentChannel = sampleVid.channel;
    }
  }

  if (currentPlaylistId && !currentTitle) {
    const samplePl = typeof getSamplePlaylistById === "function" ? getSamplePlaylistById(currentPlaylistId) : null;
    if (samplePl) {
      currentTitle = samplePl.title;
      currentChannel = samplePl.channel;
    }
  }

  if (!currentTitle) {
    currentTitle = currentPlaylistId ? "Engineering Lecture Series" : "Engineering Lecture Video";
  }
  if (!currentChannel) {
    currentChannel = "Educational Channel";
  }

  // Record into Recently Watched Study History
  if (typeof recordRecentlyWatched === "function") {
    recordRecentlyWatched({
      youtubeId: currentVideoId,
      playlistId: currentPlaylistId,
      title: currentTitle,
      channel: currentChannel,
      category: category
    });
  }

  // Update DOM labels
  const titleEl = document.getElementById("video-title");
  const channelEl = document.getElementById("video-channel");
  const categoryEl = document.getElementById("video-category");
  const modeTagEl = document.getElementById("player-mode-tag");
  const directLinkEl = document.getElementById("direct-yt-link");

  if (titleEl) titleEl.textContent = currentTitle;
  if (channelEl) channelEl.textContent = "Channel: " + currentChannel;
  if (categoryEl) categoryEl.textContent = category;

  if (modeTagEl) {
    if (currentPlaylistId) {
      modeTagEl.textContent = "📑 YouTube Playlist Mode";
      modeTagEl.style.background = "#cce5ff";
      modeTagEl.style.color = "#004085";
    } else {
      modeTagEl.textContent = "▶ Single Video Mode";
    }
  }

  // Direct YouTube link
  if (directLinkEl) {
    if (currentPlaylistId) {
      directLinkEl.href = `https://www.youtube.com/playlist?list=${encodeURIComponent(currentPlaylistId)}`;
    } else {
      directLinkEl.href = `https://www.youtube.com/watch?v=${encodeURIComponent(currentVideoId)}`;
    }
  }

  // Add to Playlist Button handler
  const addPlBtn = document.getElementById("add-playlist-btn");
  if (addPlBtn) {
    addPlBtn.addEventListener("click", () => {
      promptAddToPlaylist(currentVideoId, currentTitle, currentChannel);
    });
  }

  // If YouTube IFrame API was already loaded, initialize player immediately
  if (window.YT && window.YT.Player) {
    initYouTubePlayer();
  }
}

// ===================================================
// 2. OFFICIAL YOUTUBE IFRAME PLAYER API INTEGRATION
// ===================================================

window.onYouTubeIframeAPIReady = function() {
  initYouTubePlayer();
};

function initYouTubePlayer() {
  const container = document.getElementById("youtube-player");
  if (!container) return;

  const playerVars = {
    autoplay: 0,
    rel: 0,
    modestbranding: 1,
    enablejsapi: 1,
    origin: window.location.origin
  };

  const playerConfig = {
    height: "100%",
    width: "100%",
    playerVars: playerVars,
    events: {
      onReady: onPlayerReady,
      onError: onPlayerError,
      onStateChange: onPlayerStateChange
    }
  };

  if (currentPlaylistId) {
    playerConfig.playerVars.listType = "playlist";
    playerConfig.playerVars.list = currentPlaylistId;
    if (currentVideoId) {
      playerConfig.videoId = currentVideoId;
    }
  } else if (currentVideoId) {
    playerConfig.videoId = currentVideoId;
  }

  try {
    ytPlayer = new YT.Player("youtube-player", playerConfig);
  } catch (err) {
    console.warn("YouTube IFrame API instantiation fallback to standard iframe:", err);
    loadStandardIframeFallback();
  }
}

function onPlayerReady(event) {
  isPlayerReady = true;
  console.log("FocusTube: Official YouTube IFrame Player is ready.");
}

function onPlayerStateChange(event) {
  // Can observe state changes (1 = Playing, 2 = Paused, etc.)
}

function onPlayerError(event) {
  console.warn("YouTube Player Error code:", event.data);
  const errorBox = document.getElementById("embed-error-box");
  const errorText = document.getElementById("embed-error-text");
  const extBtn = document.getElementById("external-watch-btn");

  if (!errorBox) return;

  errorBox.style.display = "block";

  if (extBtn) {
    if (currentPlaylistId) {
      extBtn.href = `https://www.youtube.com/playlist?list=${encodeURIComponent(currentPlaylistId)}`;
    } else {
      extBtn.href = `https://www.youtube.com/watch?v=${encodeURIComponent(currentVideoId)}`;
    }
  }

  if (event.data === 101 || event.data === 150) {
    errorText.textContent = "The owner of this educational video has disabled playback in third-party embedded players. You can watch it directly on YouTube using the button below.";
  } else if (event.data === 100) {
    errorText.textContent = "This video was removed or marked private on YouTube.";
  } else if (event.data === 2) {
    errorText.textContent = "Invalid video or playlist parameter provided.";
  } else {
    errorText.textContent = "An error occurred while loading this YouTube video.";
  }
}

// Fallback if YouTube IFrame API script is blocked or offline
function loadStandardIframeFallback() {
  const container = document.querySelector(".embed-container");
  if (!container) return;

  let embedUrl = "";
  if (currentPlaylistId) {
    embedUrl = `https://www.youtube.com/embed?listType=playlist&list=${encodeURIComponent(currentPlaylistId)}&rel=0&modestbranding=1`;
  } else {
    embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(currentVideoId)}?rel=0&modestbranding=1`;
  }

  container.innerHTML = `
    <iframe 
      id="fallback-iframe" 
      src="${embedUrl}" 
      title="FocusTube Player" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen 
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;">
    </iframe>
  `;
}

// ===================================================
// 3. INTERACTIVE TIMESTAMP JUMPING (HIGH VIVA IMPACT)
// ===================================================
function seekToTimestamp(timeStr) {
  if (!timeStr || timeStr === "--:--") return;

  const seconds = typeof timeStringToSeconds === "function" 
    ? timeStringToSeconds(timeStr) 
    : parseTimeToSecondsFallback(timeStr);

  if (ytPlayer && typeof ytPlayer.seekTo === "function") {
    ytPlayer.seekTo(seconds, true);
    // If paused, trigger playback so user immediately sees the topic
    if (typeof ytPlayer.playVideo === "function") {
      ytPlayer.playVideo();
    }
  } else {
    // Fallback: reload iframe with start parameter
    const iframe = document.getElementById("fallback-iframe");
    if (iframe && iframe.src) {
      let base = iframe.src.split("&start=")[0];
      iframe.src = `${base}&start=${seconds}&autoplay=1`;
    } else {
      alert(`Jumping to timestamp ${timeStr} (${seconds}s). Start the player to observe!`);
    }
  }
}

function parseTimeToSecondsFallback(timeStr) {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

// ===================================================
// 4. POMODORO TIMER IMPLEMENTATION
// ===================================================
function initPomodoroTimer() {
  const timerDisplay = document.getElementById("timer-display");
  const startBtn = document.getElementById("timer-start-btn");
  const pauseBtn = document.getElementById("timer-pause-btn");
  const resetBtn = document.getElementById("timer-reset-btn");
  const studyModeBtn = document.getElementById("mode-study-btn");
  const breakModeBtn = document.getElementById("mode-break-btn");
  const sessionCountEl = document.getElementById("session-count");

  const savedCount = localStorage.getItem("focustube_pomodoro_count");
  if (savedCount) {
    completedPomodoros = parseInt(savedCount, 10) || 0;
    if (sessionCountEl) sessionCountEl.textContent = completedPomodoros;
  }

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (timerDisplay) timerDisplay.textContent = formatted;

    if (isTimerRunning) {
      document.title = `[${formatted}] FocusTube Study Timer`;
    } else {
      document.title = "FocusTube - Distraction-Free Focus Player";
    }
  }

  function setMode(mode) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerMode = mode;

    if (mode === "study") {
      timeLeft = studyDuration;
      studyModeBtn.classList.add("btn");
      studyModeBtn.classList.remove("btn-secondary");
      breakModeBtn.classList.add("btn-secondary");
      breakModeBtn.classList.remove("btn");
      document.getElementById("timer-mode-label").textContent = "Focus Study Mode (25 min)";
    } else {
      timeLeft = breakDuration;
      breakModeBtn.classList.add("btn");
      breakModeBtn.classList.remove("btn-secondary");
      studyModeBtn.classList.add("btn-secondary");
      studyModeBtn.classList.remove("btn");
      document.getElementById("timer-mode-label").textContent = "Short Break Mode (5 min)";
    }

    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    updateDisplay();
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";

        playBeepSound();

        if (timerMode === "study") {
          completedPomodoros++;
          localStorage.setItem("focustube_pomodoro_count", completedPomodoros);
          if (sessionCountEl) sessionCountEl.textContent = completedPomodoros;
          alert("🎉 25-Minute Study Session Completed!\nGreat job maintaining focus. Time for a 5-minute break.");
          setMode("break");
        } else {
          alert("☕ Break time is over!\nReady to get back to focused studying?");
          setMode("study");
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    updateDisplay();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = timerMode === "study" ? studyDuration : breakDuration;
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    updateDisplay();
  }

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  studyModeBtn.addEventListener("click", () => setMode("study"));
  breakModeBtn.addEventListener("click", () => setMode("break"));

  updateDisplay();
}

// ===================================================
// 5. QUICK STUDY NOTES & AUTOMATIC TIME CAPTURE
// ===================================================
function initQuickNotes() {
  const noteForm = document.getElementById("quick-note-form");
  const noteText = document.getElementById("quick-note-text");
  const timestampInput = document.getElementById("quick-note-timestamp");
  const insertTimeBtn = document.getElementById("insert-time-btn");

  // Automatic current time capture from active YouTube Player
  if (insertTimeBtn && timestampInput) {
    insertTimeBtn.addEventListener("click", () => {
      let capturedTime = "00:00";

      // If YouTube IFrame player is instantiated, read exact playback time
      if (ytPlayer && typeof ytPlayer.getCurrentTime === "function") {
        try {
          const totalSec = Math.floor(ytPlayer.getCurrentTime());
          const m = Math.floor(totalSec / 60);
          const s = totalSec % 60;
          capturedTime = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        } catch (e) {
          capturedTime = "05:00";
        }
      }

      timestampInput.value = capturedTime;
      timestampInput.focus();
    });
  }

  if (noteForm) {
    noteForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const content = noteText.value.trim();
      if (!content) {
        alert("Please write something in your note before saving.");
        return;
      }

      const noteRefId = currentVideoId || currentPlaylistId || "manual";
      const newNote = {
        id: "note_" + Date.now(),
        videoId: noteRefId,
        videoTitle: currentTitle,
        subject: currentTitle,
        timestamp: timestampInput.value.trim() || "--:--",
        content: content,
        createdAt: new Date().toLocaleDateString()
      };

      saveLocalNote(newNote);
      noteText.value = "";
      timestampInput.value = "";
      renderVideoNotes();
    });
  }

  renderVideoNotes();
}

function renderVideoNotes() {
  const container = document.getElementById("video-notes-list");
  if (!container) return;

  const noteRefId = currentVideoId || currentPlaylistId;
  const allNotes = getLocalNotes();
  const videoNotes = allNotes.filter(n => n.videoId === noteRefId);

  if (videoNotes.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #888888; padding: 15px; font-size: 13px;">
        No notes yet for this lecture. Click <strong>"Set Time"</strong> to bookmark formulas, definitions, or exam questions!
      </div>
    `;
    return;
  }

  container.innerHTML = videoNotes.map(note => `
    <div class="note-item" id="note-item-${note.id}">
      <div class="note-item-header">
        <button 
          type="button" 
          class="btn btn-secondary btn-sm" 
          onclick="seekToTimestamp('${escapeJs(note.timestamp)}')"
          title="Click to jump video directly to this timestamp"
          style="padding: 2px 7px; font-size: 11px; font-weight: bold; color: #0056b3; background: #eef5fc; border-color: #cce2f7;"
        >
          ▶ ⏱ Jump to ${escapeHtml(note.timestamp)}
        </button>
        <span style="align-self: center;">${escapeHtml(note.createdAt)}</span>
      </div>
      <div class="note-item-text" id="note-content-${note.id}">${escapeHtml(note.content)}</div>
      <div class="note-actions">
        <button class="btn btn-secondary btn-sm" onclick="editVideoNote('${note.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteVideoNote('${note.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function editVideoNote(noteId) {
  const allNotes = getLocalNotes();
  const note = allNotes.find(n => n.id === noteId);
  if (!note) return;

  const updatedText = prompt("Edit your study note:", note.content);
  if (updatedText !== null && updatedText.trim() !== "") {
    note.content = updatedText.trim();
    saveLocalNote(note);
    renderVideoNotes();
  }
}

function deleteVideoNote(noteId) {
  if (confirm("Are you sure you want to delete this note?")) {
    deleteLocalNote(noteId);
    renderVideoNotes();
  }
}

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

// ===================================================
// 6. CUSTOM YOUTUBE URL LOADER & EMBEDDER
// ===================================================
function initCustomUrlLoader() {
  const btn = document.getElementById("load-custom-url-btn");
  const input = document.getElementById("custom-embed-input");
  if (!btn || !input) return;

  const handleLoad = () => {
    const raw = input.value.trim();
    if (!raw) {
      alert("Please paste a valid YouTube video or playlist link.");
      return;
    }

    const parsed = parseYouTubeUrl(raw);
    if (!parsed) {
      alert("Invalid YouTube URL. Please provide a standard watch link (youtube.com/watch?v=...) or playlist link.");
      return;
    }

    if (parsed.playlistId && !parsed.videoId) {
      window.location.href = `focus.html?list=${encodeURIComponent(parsed.playlistId)}&title=Embedded%20Playlist`;
    } else if (parsed.videoId) {
      const listParam = parsed.playlistId ? `&list=${encodeURIComponent(parsed.playlistId)}` : "";
      window.location.href = `focus.html?v=${encodeURIComponent(parsed.videoId)}${listParam}&title=Embedded%20Lecture`;
    }
  };

  btn.addEventListener("click", handleLoad);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLoad();
  });
}

function parseYouTubeUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return null;
  const str = urlStr.trim();

  let videoId = null;
  let playlistId = null;

  const listMatch = str.match(/[?&]list=([^#&?]+)/);
  if (listMatch) playlistId = listMatch[1];

  const vMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (vMatch) videoId = vMatch[1];

  if (!videoId && !playlistId && str.length === 11 && !str.includes(" ")) {
    videoId = str;
  }

  if (videoId || playlistId) {
    return { videoId, playlistId };
  }
  return null;
}
