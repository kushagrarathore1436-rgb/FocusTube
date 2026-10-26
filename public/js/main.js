/**
 * FocusTube - Homepage & YouTube Data API v3 Controller (main.js)
 * Supports live video and playlist searches, pagination, branch filtering,
 * and seamless fallback to curated engineering sample datasets.
 */

// Application State
let currentSearchType = "video"; // "video" or "playlist"
let currentBranch = "All";
let currentSubject = "All";
let currentSearchQuery = "";
let currentNextPageToken = null;
let isLiveApiActive = false;
let hasServerApiKey = false;
let displayedResults = [];

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  initSearchTypeToggle();
  initBranchChips();
  initSubjectChips();
  initChannelQuickChips();
  initSearchForm();
  initApiKeyControls();
  initLoadMoreButton();

  // Render study history shelf
  renderRecentlyWatchedShelf();

  // Check server API key configuration
  await checkServerApiStatus();

  // Load initial videos
  executeSearch(false);
});

// ===================================================
// 1. CHECK SERVER-SIDE YOUTUBE API STATUS
// ===================================================
async function checkServerApiStatus() {
  try {
    const res = await fetch("/api/youtube/status");
    if (res.ok) {
      const data = await res.json();
      hasServerApiKey = data.hasServerKey;
    }
  } catch (err) {
    hasServerApiKey = false;
  }
}

// Determine if we should query live API
function getActiveApiKey() {
  const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  if (localKey && localKey.trim().length > 10) {
    return localKey.trim();
  }
  if (hasServerApiKey) {
    return "SERVER_CONFIGURED";
  }
  return null;
}

// ===================================================
// 2. SEARCH & DATA RETRIEVAL (API OR SAMPLE FALLBACK)
// ===================================================

async function executeSearch(isAppend = false) {
  const gridContainer = document.getElementById("video-grid");
  const loadMoreBox = document.getElementById("load-more-container");
  const errorBanner = document.getElementById("api-error-banner");
  const resultsHeading = document.getElementById("results-heading");

  if (errorBanner) errorBanner.style.display = "none";

  if (!isAppend) {
    currentNextPageToken = null;
    displayedResults = [];
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #555555;">
        <p style="font-size: 16px; font-weight: bold; color: #0056b3;">Searching Educational Content...</p>
        <p style="font-size: 13px;">Retrieving engineering ${currentSearchType}s...</p>
      </div>
    `;
  }

  // Update Section Heading
  if (resultsHeading) {
    resultsHeading.textContent = currentSearchType === "playlist" 
      ? "Engineering YouTube Playlists" 
      : "Engineering Educational Lectures";
  }

  const activeKey = getActiveApiKey();

  // Check if live API is available
  if (activeKey) {
    // --- LIVE YOUTUBE DATA API V3 QUERY ---
    try {
      let queryUrl = `/api/youtube/search?type=${encodeURIComponent(currentSearchType)}&maxResults=12`;

      if (currentSearchQuery) {
        queryUrl += `&q=${encodeURIComponent(currentSearchQuery)}`;
      }
      if (currentBranch !== "All") {
        queryUrl += `&branch=${encodeURIComponent(currentBranch)}`;
      }
      if (currentSubject !== "All") {
        queryUrl += `&subject=${encodeURIComponent(currentSubject)}`;
      }
      if (isAppend && currentNextPageToken) {
        queryUrl += `&pageToken=${encodeURIComponent(currentNextPageToken)}`;
      }

      const headers = {};
      const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      if (localKey) {
        headers["X-YouTube-API-Key"] = localKey.trim();
      }

      const response = await fetch(queryUrl, { headers });
      const data = await response.json();

      // Handle Quota limit or Invalid Key returned from server
      if (data.isLive === false && data.error) {
        // If client had a stored custom key that failed, but server has a working key, retry with server key
        if (localKey && hasServerApiKey) {
          console.warn("Custom YouTube API key failed. Falling back to server-configured API key.");
          localStorage.removeItem(STORAGE_KEYS.API_KEY);
          const fallbackRes = await fetch(queryUrl);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.isLive) {
            isLiveApiActive = true;
            currentNextPageToken = fallbackData.nextPageToken || null;
            displayedResults = isAppend ? displayedResults.concat(fallbackData.items) : fallbackData.items;
            updateDataSourceBadge(true, `YouTube Data API v3 (Query: "${currentSearchQuery || currentBranch || currentSubject}")`);
            renderResults(displayedResults, isAppend);
            if (loadMoreBox) {
              loadMoreBox.style.display = currentNextPageToken ? "block" : "none";
            }
            return;
          }
        }

        handleApiError(data.message || data.error);
        loadSampleDataFallback(isAppend);
        return;
      }

      if (data.isLive) {
        isLiveApiActive = true;
        currentNextPageToken = data.nextPageToken || null;

        if (isAppend) {
          displayedResults = displayedResults.concat(data.items);
        } else {
          displayedResults = data.items;
        }

        updateDataSourceBadge(true, `YouTube Data API v3 (Query: "${currentSearchQuery || currentBranch || currentSubject}")`);
        renderResults(displayedResults, isAppend);

        // Show/hide Load More button
        if (loadMoreBox) {
          loadMoreBox.style.display = currentNextPageToken ? "block" : "none";
        }
        return;
      }

    } catch (err) {
      console.warn("Live YouTube API fetch failed, falling back to sample repository:", err);
      handleApiError("Network error while connecting to YouTube API. Switched to offline engineering repository.");
      loadSampleDataFallback(isAppend);
      return;
    }
  }

  // Fallback: Use Curated Offline Engineering Repository
  loadSampleDataFallback(isAppend);
}

// Fallback to sample data
function loadSampleDataFallback(isAppend) {
  isLiveApiActive = false;
  const loadMoreBox = document.getElementById("load-more-container");

  if (currentSearchType === "playlist") {
    // Filter sample playlists
    let list = typeof SAMPLE_ENGINEERING_PLAYLISTS !== "undefined" ? [...SAMPLE_ENGINEERING_PLAYLISTS] : [];

    if (currentBranch !== "All") {
      list = list.filter(p => p.branch === currentBranch);
    }
    if (currentSubject !== "All") {
      list = list.filter(p => p.subject === currentSubject);
    }
    if (currentSearchQuery.trim() !== "") {
      const q = currentSearchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.channel.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    displayedResults = list;
    updateDataSourceBadge(false, "Curated Sample Engineering Playlists (Offline Mode)");
    renderResults(displayedResults, false);
    if (loadMoreBox) loadMoreBox.style.display = "none";

  } else {
    // Filter sample videos
    let list = typeof SAMPLE_ENGINEERING_VIDEOS !== "undefined" ? [...SAMPLE_ENGINEERING_VIDEOS] : [];

    if (currentBranch !== "All") {
      list = list.filter(v => v.branch === currentBranch);
    }
    if (currentSubject !== "All") {
      list = list.filter(v => v.subject === currentSubject);
    }
    if (currentSearchQuery.trim() !== "") {
      const q = currentSearchQuery.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q)));
    }

    displayedResults = list;
    updateDataSourceBadge(false, "Curated Sample Engineering Lectures (Offline Mode)");
    renderResults(displayedResults, false);
    if (loadMoreBox) loadMoreBox.style.display = "none";
  }
}

// ===================================================
// 3. RENDERING VIDEO & PLAYLIST CARDS
// ===================================================

function renderResults(items, isAppend) {
  const gridContainer = document.getElementById("video-grid");
  const resultCount = document.getElementById("result-count");
  if (!gridContainer) return;

  if (resultCount) {
    resultCount.textContent = `Showing ${items.length} ${currentSearchType}s`;
  }

  if (items.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No ${currentSearchType}s found</h3>
        <p>Try searching with another engineering topic or choose "All Disciplines".</p>
        <button class="btn btn-secondary" onclick="resetAllFilters()" style="margin-top: 10px;">Reset All Filters</button>
      </div>
    `;
    return;
  }

  const html = items.map(item => {
    if (currentSearchType === "playlist") {
      return createPlaylistCardHtml(item);
    } else {
      return createVideoCardHtml(item);
    }
  }).join("");

  if (isAppend) {
    gridContainer.insertAdjacentHTML("beforeend", html);
  } else {
    gridContainer.innerHTML = html;
  }
}

// Generate HTML for individual Video Card
function createVideoCardHtml(video) {
  // If the API is configured and returning real video information, remove the "Sample" label from genuine API results
  const sourceBadge = video.isSample 
    ? '<span style="font-size: 10px; background: #e9ecef; color: #495057; padding: 2px 4px; border-radius: 2px;">Sample</span>'
    : '';

  const watchUrl = `focus.html?v=${encodeURIComponent(video.youtubeId)}&title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channel)}&category=${encodeURIComponent(video.category || video.branch || "Engineering")}`;
  const thumbUrl = video.thumbnailUrl || 'images/thumbnail-fallback.svg';

  return `
    <div class="video-card">
      <div class="thumbnail-wrap">
        <a href="${watchUrl}">
          <img src="${thumbUrl}" alt="${escapeHtml(video.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='images/thumbnail-fallback.svg';">
        </a>
        <span class="duration-tag">${video.duration || "Lecture"}</span>
      </div>
      <div class="video-info">
        <a href="${watchUrl}" class="video-title" title="${escapeHtml(video.title)}">
          ${escapeHtml(video.title)}
        </a>
        <div class="video-channel">${escapeHtml(video.channel)}</div>
        <div class="video-meta">
          <span class="video-category-tag">${escapeHtml(video.subject || video.category || video.branch || "Lecture")}</span>
          ${sourceBadge}
        </div>
        ${video.views ? `<div style="font-size: 11px; color: #888888; margin-bottom: 8px;">${escapeHtml(video.views)}</div>` : ""}
        <div class="video-card-actions">
          <a href="${watchUrl}" class="btn btn-sm">Watch in Focus Player</a>
          <button class="btn btn-secondary btn-sm" onclick="promptAddToPlaylist('${escapeHtml(video.youtubeId)}', '${escapeJs(video.title)}', '${escapeJs(video.channel)}')">+ Playlist</button>
        </div>
      </div>
    </div>
  `;
}

// Generate HTML for individual Playlist Card
function createPlaylistCardHtml(playlist) {
  // If the API is configured and returning real playlist information, remove the "Sample" label from genuine API results
  const sourceBadge = playlist.isSample
    ? '<span style="font-size: 10px; background: #e9ecef; color: #495057; padding: 2px 4px; border-radius: 2px;">Sample</span>'
    : '';

  const playlistUrl = `focus.html?list=${encodeURIComponent(playlist.playlistId)}&title=${encodeURIComponent(playlist.title)}&channel=${encodeURIComponent(playlist.channel)}&category=${encodeURIComponent(playlist.branch || "Playlist")}`;
  const thumbUrl = playlist.thumbnailUrl || 'images/playlist-fallback.svg';

  return `
    <div class="video-card">
      <div class="thumbnail-wrap">
        <a href="${playlistUrl}">
          <img src="${thumbUrl}" alt="${escapeHtml(playlist.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='images/playlist-fallback.svg';">
        </a>
        <span class="playlist-badge">📑 PLAYLIST</span>
        ${playlist.itemCount ? `<span class="duration-tag">${playlist.itemCount} Videos</span>` : ""}
      </div>
      <div class="video-info">
        <a href="${playlistUrl}" class="video-title" title="${escapeHtml(playlist.title)}">
          ${escapeHtml(playlist.title)}
        </a>
        <div class="video-channel">${escapeHtml(playlist.channel)}</div>
        <div class="video-meta">
          <span class="video-category-tag">${escapeHtml(playlist.subject || playlist.category || playlist.branch || "Course")}</span>
          ${sourceBadge}
        </div>
        ${playlist.description ? `<p style="font-size: 12px; color: #666666; margin-bottom: 10px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(playlist.description)}</p>` : ""}
        <div class="video-card-actions">
          <a href="${playlistUrl}" class="btn btn-sm" style="width: 100%;">Open Playlist in Focus Player</a>
        </div>
      </div>
    </div>
  `;
}

// ===================================================
// 4. UI EVENT LISTENERS & FILTER CONTROLS
// ===================================================

function initSearchTypeToggle() {
  const radioVideos = document.getElementById("search-type-video");
  const radioPlaylists = document.getElementById("search-type-playlist");
  const searchInput = document.getElementById("search-input");

  if (radioVideos && radioPlaylists) {
    radioVideos.addEventListener("change", () => {
      if (radioVideos.checked) {
        currentSearchType = "video";
        if (searchInput) searchInput.placeholder = "Search engineering lectures (e.g. Binary Search Tree, Thermodynamics, GATE)...";
        executeSearch(false);
      }
    });

    radioPlaylists.addEventListener("change", () => {
      if (radioPlaylists.checked) {
        currentSearchType = "playlist";
        if (searchInput) searchInput.placeholder = "Search engineering playlists (e.g. NPTEL DBMS, Abdul Bari Algorithms, Gate Smashers OS)...";
        executeSearch(false);
      }
    });
  }
}

function initBranchChips() {
  const container = document.getElementById("branch-chips-container");
  if (!container) return;

  const chips = container.querySelectorAll(".category-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentBranch = chip.getAttribute("data-branch") || "All";
      executeSearch(false);
    });
  });
}

function initSubjectChips() {
  const container = document.getElementById("subject-chips-container");
  if (!container) return;

  const chips = container.querySelectorAll(".category-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentSubject = chip.getAttribute("data-subject") || "All";
      executeSearch(false);
    });
  });
}

function initChannelQuickChips() {
  const container = document.getElementById("channel-quick-container");
  const input = document.getElementById("search-input");
  if (!container) return;

  const chips = container.querySelectorAll(".category-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const wasActive = chip.classList.contains("active");
      chips.forEach(c => c.classList.remove("active"));

      if (wasActive) {
        currentSearchQuery = "";
        if (input) input.value = "";
      } else {
        chip.classList.add("active");
        const channelQuery = chip.getAttribute("data-channel-query");
        currentSearchQuery = channelQuery;
        if (input) input.value = channelQuery;
      }

      executeSearch(false);
    });
  });
}

function initSearchForm() {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search-btn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawQuery = input.value.trim();

      // Check if user pasted a direct YouTube Video or Playlist link
      const parsed = parseYouTubeUrl(rawQuery);
      if (parsed) {
        if (parsed.playlistId && !parsed.videoId) {
          window.location.href = `focus.html?list=${encodeURIComponent(parsed.playlistId)}&title=YouTube%20Playlist`;
          return;
        } else if (parsed.videoId) {
          const listParam = parsed.playlistId ? `&list=${encodeURIComponent(parsed.playlistId)}` : "";
          window.location.href = `focus.html?v=${encodeURIComponent(parsed.videoId)}${listParam}&title=Embedded%20Lecture`;
          return;
        }
      }

      currentSearchQuery = rawQuery;
      executeSearch(false);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetAllFilters();
    });
  }
}

// Utility to parse any YouTube URL format (watch, youtu.be, embed, playlist)
function parseYouTubeUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return null;
  const str = urlStr.trim();

  let videoId = null;
  let playlistId = null;

  // Extract playlist ID if present
  const listMatch = str.match(/[?&]list=([^#&?]+)/);
  if (listMatch) playlistId = listMatch[1];

  // Extract video ID from standard watch or shortened youtu.be
  const vMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (vMatch) videoId = vMatch[1];

  // If raw 11-char video ID pasted
  if (!videoId && !playlistId && str.length === 11 && !str.includes(" ")) {
    videoId = str;
  }

  if (videoId || playlistId) {
    return { videoId, playlistId };
  }
  return null;
}

function initLoadMoreButton() {
  const btn = document.getElementById("load-more-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      if (currentNextPageToken) {
        executeSearch(true);
      }
    });
  }
}

function resetAllFilters() {
  currentBranch = "All";
  currentSubject = "All";
  currentSearchQuery = "";
  currentNextPageToken = null;

  const input = document.getElementById("search-input");
  if (input) input.value = "";

  document.querySelectorAll("#branch-chips-container .category-chip").forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-branch") === "All");
  });

  document.querySelectorAll("#subject-chips-container .category-chip").forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-subject") === "All");
  });

  document.querySelectorAll("#channel-quick-container .category-chip").forEach(c => {
    c.classList.remove("active");
  });

  executeSearch(false);
}

// ===================================================
// 5. YOUTUBE API KEY CONFIGURATION MODAL / DRAWER
// ===================================================
function initApiKeyControls() {
  const toggleBtn = document.getElementById("toggle-api-box");
  const apiBox = document.getElementById("api-config-box");
  const saveKeyBtn = document.getElementById("save-api-key-btn");
  const clearKeyBtn = document.getElementById("clear-api-key-btn");
  const apiKeyInput = document.getElementById("api-key-input");

  // Restore saved key in input
  const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  if (savedKey && apiKeyInput) {
    apiKeyInput.value = savedKey;
  }

  if (toggleBtn && apiBox) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = apiBox.style.display === "none" || apiBox.style.display === "";
      apiBox.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden ? "▲ Hide API Settings" : "▼ YouTube Data API v3 Settings";
    });
  }

  if (saveKeyBtn && apiKeyInput) {
    saveKeyBtn.addEventListener("click", () => {
      const val = apiKeyInput.value.trim();
      if (!val) {
        alert("Please enter a valid Google YouTube Data API v3 key.");
        return;
      }
      localStorage.setItem(STORAGE_KEYS.API_KEY, val);
      alert("YouTube Data API key saved! FocusTube will now search live YouTube.");
      executeSearch(false);
    });
  }

  if (clearKeyBtn && apiKeyInput) {
    clearKeyBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      apiKeyInput.value = "";
      alert("API key removed from browser. FocusTube will use sample courseware or server key.");
      executeSearch(false);
    });
  }
}

function handleApiError(message) {
  const banner = document.getElementById("api-error-banner");
  const msgEl = document.getElementById("api-error-message");
  if (banner && msgEl) {
    msgEl.innerHTML = `<strong>YouTube API Notice:</strong> ${escapeHtml(message)}`;
    banner.style.display = "block";
  }
}

function updateDataSourceBadge(isLive, labelText) {
  const badge = document.getElementById("data-source-badge");
  if (!badge) return;

  if (isLive) {
    badge.innerHTML = `<strong>Data Source:</strong> <span style="color: #28a745; font-weight: bold;">● Live YouTube Data API v3</span> - ${escapeHtml(labelText)}`;
  } else {
    badge.innerHTML = `<strong>Data Source:</strong> <span style="color: #0056b3; font-weight: bold;">● Curated Sample Mode</span> - ${escapeHtml(labelText)}`;
  }
}

// ===================================================
// 6. RECENTLY WATCHED STUDY HISTORY SHELF
// ===================================================
function renderRecentlyWatchedShelf() {
  const section = document.getElementById("recent-history-section");
  const listContainer = document.getElementById("recent-history-list");
  const clearBtn = document.getElementById("clear-history-btn");
  if (!section || !listContainer) return;

  const history = typeof getRecentlyWatched === "function" ? getRecentlyWatched() : [];
  if (history.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  listContainer.innerHTML = history.slice(0, 4).map(item => {
    const playUrl = item.playlistId 
      ? `focus.html?list=${encodeURIComponent(item.playlistId)}&title=${encodeURIComponent(item.title)}`
      : `focus.html?v=${encodeURIComponent(item.youtubeId)}&title=${encodeURIComponent(item.title)}`;
    
    return `
      <div style="background: #ffffff; border: 1px solid #dcdcdc; border-radius: 4px; padding: 10px; font-size: 13px;">
        <div style="font-weight: bold; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <a href="${playUrl}" style="color: #0056b3; text-decoration: none;" title="${escapeHtml(item.title)}">
            ${escapeHtml(item.title)}
          </a>
        </div>
        <div style="font-size: 11px; color: #666666; display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>${escapeHtml(item.channel)}</span>
          <span>${escapeHtml(item.watchedAt)}</span>
        </div>
        <a href="${playUrl}" class="btn btn-secondary btn-sm" style="width: 100%; padding: 3px 6px; font-size: 11px;">▶ Resume Lecture</a>
      </div>
    `;
  }).join("");

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm("Clear your study history?")) {
        clearRecentlyWatched();
        renderRecentlyWatchedShelf();
      }
    };
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function escapeJs(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
