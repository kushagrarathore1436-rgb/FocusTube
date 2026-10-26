/**
 * FocusTube - Playlists Management (playlists.js)
 * Supports searching official YouTube course playlists and managing
 * student custom study lists.
 */

document.addEventListener("DOMContentLoaded", () => {
  initPlaylistsPage();
  initYouTubePlaylistSearch();
  initChannelFilterChips();

  // Automatically load top Indian engineering playlists on initial load
  fetchAndRenderPlaylists("Gate Smashers Neso Academy");
});

function initPlaylistsPage() {
  const createForm = document.getElementById("create-playlist-form");
  if (createForm) {
    createForm.addEventListener("submit", handleCreatePlaylist);
  }

  renderPersonalPlaylists();
}

// ===================================================
// 1. YOUTUBE COURSE PLAYLIST SEARCH & CHANNEL CHIPS
// ===================================================
function initChannelFilterChips() {
  const container = document.getElementById("channel-chips-container");
  const input = document.getElementById("playlist-search-input");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const chip = e.target.closest(".category-chip");
    if (!chip) return;

    // Toggle active state
    container.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    const channel = chip.getAttribute("data-channel");
    if (channel === "All") {
      if (input) input.value = "";
      fetchAndRenderPlaylists("Gate Smashers Neso Academy");
    } else {
      if (input) input.value = channel;
      fetchAndRenderPlaylists(channel);
    }
  });
}

function initYouTubePlaylistSearch() {
  const form = document.getElementById("playlist-search-form");
  const input = document.getElementById("playlist-search-input");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      fetchAndRenderPlaylists(query);
    });
  }
}

async function fetchAndRenderPlaylists(query) {
  const resultsContainer = document.getElementById("yt-playlists-results");
  if (!resultsContainer) return;

  resultsContainer.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: #555555;">
      <p style="font-size: 15px; font-weight: bold; color: #0056b3;">Searching Playlists for "${escapeHtml(query)}"...</p>
      <p style="font-size: 12px;">Fetching official course playlists from YouTube Data API...</p>
    </div>
  `;

  try {
    const localKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    const headers = localKey ? { "X-YouTube-API-Key": localKey.trim() } : {};

    const res = await fetch(`/api/youtube/search?type=playlist&q=${encodeURIComponent(query)}&maxResults=12`, { headers });
    const data = await res.json();

    if (data.isLive && data.items && data.items.length > 0) {
      renderYouTubePlaylistResults(data.items);
      return;
    }

    // Fallback: match against curated Indian lecture playlists repository
    const qLower = query.toLowerCase();
    const isAll = qLower.includes("gate smashers") && qLower.includes("neso academy");
    
    let matches = typeof SAMPLE_ENGINEERING_PLAYLISTS !== "undefined" ? [...SAMPLE_ENGINEERING_PLAYLISTS] : [];
    if (!isAll) {
      matches = matches.filter(p =>
        p.title.toLowerCase().includes(qLower) ||
        p.channel.toLowerCase().includes(qLower) ||
        (p.subject && p.subject.toLowerCase().includes(qLower)) ||
        (p.branch && p.branch.toLowerCase().includes(qLower))
      );
    }

    if (matches.length > 0) {
      renderYouTubePlaylistResults(matches);
    } else {
      resultsContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No playlists found for "${escapeHtml(query)}"</h3>
          <p>Try searching another topic like "DBMS", "Operating Systems", "Digital Electronics", or select a channel chip above.</p>
        </div>
      `;
    }

  } catch (err) {
    console.warn("YouTube playlist search failed, using curated repository:", err);
    const fallbackList = typeof SAMPLE_ENGINEERING_PLAYLISTS !== "undefined" ? SAMPLE_ENGINEERING_PLAYLISTS : [];
    renderYouTubePlaylistResults(fallbackList);
  }
}

function renderYouTubePlaylistResults(playlists) {
  const container = document.getElementById("yt-playlists-results");
  if (!container) return;

  container.innerHTML = playlists.map(pl => {
    const plUrl = `focus.html?list=${encodeURIComponent(pl.playlistId || pl.id)}&title=${encodeURIComponent(pl.title)}&channel=${encodeURIComponent(pl.channel || '')}`;
    return `
      <div class="video-card">
        <div class="thumbnail-wrap">
          <a href="${plUrl}">
            <img src="${pl.thumbnailUrl || 'images/playlist-fallback.svg'}" alt="${escapeHtml(pl.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='images/playlist-fallback.svg';">
          </a>
          <span class="playlist-badge">📑 PLAYLIST</span>
          ${pl.itemCount ? `<span class="duration-tag">${pl.itemCount} Videos</span>` : ""}
        </div>
        <div class="video-info">
          <a href="${plUrl}" class="video-title" title="${escapeHtml(pl.title)}">
            ${escapeHtml(pl.title)}
          </a>
          <div class="video-channel">${escapeHtml(pl.channel || 'Educational Channel')}</div>
          <div class="video-meta">
            <span class="video-category-tag">${escapeHtml(pl.subject || pl.category || 'Course')}</span>
            <span style="font-size: 10px; color: #28a745; font-weight: bold;">YouTube</span>
          </div>
          <div class="video-card-actions">
            <a href="${plUrl}" class="btn btn-sm" style="width: 100%;">Open in Focus Player</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ===================================================
// 2. PERSONAL CUSTOM STUDY PLAYLISTS
// ===================================================

function handleCreatePlaylist(e) {
  e.preventDefault();
  const input = document.getElementById("new-playlist-name");
  const name = input.value.trim();

  if (!name) {
    alert("Please enter a playlist name.");
    return;
  }

  const playlists = getLocalPlaylists();
  const newPlaylist = {
    id: "pl_" + Date.now(),
    name: name,
    videos: []
  };

  playlists.unshift(newPlaylist);
  saveLocalPlaylists(playlists);

  input.value = "";
  alert(`Playlist "${name}" created successfully!`);
  renderPersonalPlaylists();
}

function deletePlaylist(playlistId) {
  let playlists = getLocalPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return;

  if (confirm(`Are you sure you want to delete the playlist "${pl.name}"?`)) {
    playlists = playlists.filter(p => p.id !== playlistId);
    saveLocalPlaylists(playlists);
    renderPersonalPlaylists();
  }
}

function removeVideoFromPlaylist(playlistId, youtubeId) {
  const playlists = getLocalPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return;

  pl.videos = pl.videos.filter(v => v.youtubeId !== youtubeId);
  saveLocalPlaylists(playlists);
  renderPersonalPlaylists();
}

function renderPersonalPlaylists() {
  const container = document.getElementById("playlists-container");
  if (!container) return;

  const playlists = getLocalPlaylists();

  if (playlists.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>No Personal Playlists Created Yet</h3>
        <p>Use the form above to create your first personal study list (e.g. "DSA Exam Prep").</p>
      </div>
    `;
    return;
  }

  container.innerHTML = playlists.map(pl => `
    <div class="playlist-card">
      <div class="playlist-card-header">
        <div>
          <h3>${escapeHtml(pl.name)}</h3>
          <span style="font-size: 12px; color: #666666;">${pl.videos.length} videos</span>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deletePlaylist('${pl.id}')" title="Delete playlist">Delete</button>
      </div>

      <div style="margin-top: 10px;">
        ${pl.videos.length === 0 ? `
          <div style="font-size: 13px; color: #888888; font-style: italic; padding: 10px 0;">
            No videos in this playlist yet. Add videos from the Home or Focus Player page!
          </div>
        ` : `
          <div style="max-height: 250px; overflow-y: auto;">
            ${pl.videos.map(video => `
              <div class="playlist-video-item">
                <div style="flex: 1; margin-right: 10px;">
                  <a href="focus.html?v=${encodeURIComponent(video.youtubeId)}&title=${encodeURIComponent(video.title)}&channel=${encodeURIComponent(video.channel || '')}" style="font-weight: bold; color: #0056b3; text-decoration: none;">
                    ${escapeHtml(video.title)}
                  </a>
                  <div style="font-size: 11px; color: #777777;">${escapeHtml(video.channel || 'Educational Video')}</div>
                </div>
                <div style="display: flex; gap: 4px;">
                  <a href="focus.html?v=${encodeURIComponent(video.youtubeId)}&title=${encodeURIComponent(video.title)}" class="btn btn-sm" style="padding: 3px 7px; font-size: 11px;">Play</a>
                  <button class="btn btn-secondary btn-sm" onclick="removeVideoFromPlaylist('${pl.id}', '${video.youtubeId}')" style="padding: 3px 7px; font-size: 11px;">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>
    </div>
  `).join("");
}

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
