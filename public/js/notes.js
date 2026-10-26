/**
 * FocusTube - Study Notes Management (notes.js)
 * Full CRUD operations, keyword searching, text export,
 * and two-way synchronization with Express / MongoDB.
 */

let editingNoteId = null;

document.addEventListener("DOMContentLoaded", async () => {
  await initNotesPage();
});

async function initNotesPage() {
  const noteForm = document.getElementById("note-form");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const searchInput = document.getElementById("search-notes-input");
  const exportBtn = document.getElementById("export-notes-btn");
  const syncBadge = document.getElementById("notes-sync-status");

  if (noteForm) {
    noteForm.addEventListener("submit", handleNoteFormSubmit);
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEditMode);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderAllNotes(searchInput.value.trim().toLowerCase());
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener("click", exportNotesAsText);
  }

  // Pre-fill subject dropdown with core engineering disciplines
  populateSubjectDropdown();

  // Initial render from local cache
  renderAllNotes();

  // Asynchronous two-way sync with Express & MongoDB backend
  if (typeof syncNotesWithBackend === "function") {
    try {
      const result = await syncNotesWithBackend();
      if (result.success && syncBadge) {
        syncBadge.textContent = "💾 Synced with Database";
        syncBadge.style.background = "#d4edda";
        syncBadge.style.color = "#155724";
        syncBadge.style.borderColor = "#c3e6cb";
      }
      renderAllNotes();
    } catch (e) {
      if (syncBadge) syncBadge.textContent = "💾 Local Storage Mode";
    }
  }
}

function populateSubjectDropdown() {
  const select = document.getElementById("note-subject-select");
  if (!select) return;

  const subjects = [
    "Data Structures & Algorithms",
    "Operating Systems",
    "DBMS (Database Management)",
    "Computer Networks",
    "Signals and Systems",
    "Thermodynamics",
    "Fluid Mechanics",
    "Structural Analysis",
    "Engineering Mathematics",
    "Web Development",
    "GATE Preparation",
    "General Engineering"
  ];

  subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    select.appendChild(opt);
  });
}

function handleNoteFormSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById("note-title-input");
  const subjectSelect = document.getElementById("note-subject-select");
  const timestampInput = document.getElementById("note-timestamp-input");
  const contentInput = document.getElementById("note-content-input");

  const title = titleInput.value.trim();
  const subject = subjectSelect.value;
  const timestamp = timestampInput.value.trim() || "--:--";
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Please provide both a Title and Note Content.");
    return;
  }

  if (editingNoteId) {
    const allNotes = getLocalNotes();
    const note = allNotes.find(n => n.id === editingNoteId);
    if (note) {
      note.videoTitle = title;
      note.subject = subject;
      note.timestamp = timestamp;
      note.content = content;
      note.updatedAt = new Date().toLocaleDateString();
      saveLocalNote(note);
      alert("Note updated successfully!");
    }
    cancelEditMode();
  } else {
    const newNote = {
      id: "note_" + Date.now(),
      videoId: "manual",
      videoTitle: title,
      subject: subject,
      timestamp: timestamp,
      content: content,
      createdAt: new Date().toLocaleDateString()
    };
    saveLocalNote(newNote);
    alert("New note saved!");
  }

  noteFormReset();
  renderAllNotes();
}

function noteFormReset() {
  document.getElementById("note-title-input").value = "";
  document.getElementById("note-timestamp-input").value = "";
  document.getElementById("note-content-input").value = "";
}

function startEditNote(noteId) {
  const allNotes = getLocalNotes();
  const note = allNotes.find(n => n.id === noteId);
  if (!note) return;

  editingNoteId = note.id;
  document.getElementById("form-heading").textContent = "Edit Study Note";
  document.getElementById("save-note-btn").textContent = "Update Note";
  document.getElementById("cancel-edit-btn").style.display = "inline-block";

  document.getElementById("note-title-input").value = note.videoTitle || "";
  document.getElementById("note-subject-select").value = note.subject || "Data Structures & Algorithms";
  document.getElementById("note-timestamp-input").value = note.timestamp || "";
  document.getElementById("note-content-input").value = note.content || "";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEditMode() {
  editingNoteId = null;
  document.getElementById("form-heading").textContent = "Create New Study Note";
  document.getElementById("save-note-btn").textContent = "Save Note";
  document.getElementById("cancel-edit-btn").style.display = "none";
  noteFormReset();
}

function deleteNote(noteId) {
  if (confirm("Are you sure you want to delete this study note?")) {
    deleteLocalNote(noteId);
    if (editingNoteId === noteId) {
      cancelEditMode();
    }
    renderAllNotes();
  }
}

function jumpToNoteVideo(videoId, timestamp) {
  if (!videoId || videoId === "manual") {
    alert("This is a manual general note not associated with a specific YouTube lecture.");
    return;
  }
  window.location.href = `focus.html?v=${encodeURIComponent(videoId)}`;
}

function renderAllNotes(filterQuery = "") {
  const container = document.getElementById("all-notes-container");
  const countBadge = document.getElementById("notes-total-count");
  if (!container) return;

  let notes = getLocalNotes();

  if (filterQuery) {
    notes = notes.filter(n => 
      (n.videoTitle && n.videoTitle.toLowerCase().includes(filterQuery)) ||
      (n.subject && n.subject.toLowerCase().includes(filterQuery)) ||
      (n.content && n.content.toLowerCase().includes(filterQuery))
    );
  }

  if (countBadge) {
    countBadge.textContent = `${notes.length} notes`;
  }

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Study Notes Found</h3>
        <p>You haven't added any notes matching your search. Create one using the form on the left or take notes while watching lectures!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(note => `
    <div class="light-section" style="margin-bottom: 15px; background-color: #ffffff; border: 1px solid #d5d5d5;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <div>
          <h3 style="font-size: 17px; color: #0056b3; margin-bottom: 4px;">${escapeHtml(note.videoTitle || "Untitled Note")}</h3>
          <div style="font-size: 12px; color: #666666; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <span class="video-category-tag">${escapeHtml(note.subject || "General")}</span>
            <span style="color: #0056b3; font-weight: bold;">⏱ Time: ${escapeHtml(note.timestamp || "--:--")}</span>
            <span>📅 Created: ${escapeHtml(note.createdAt || "Recent")}</span>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          ${note.videoId && note.videoId !== "manual" 
            ? `<button onclick="jumpToNoteVideo('${escapeJs(note.videoId)}', '${escapeJs(note.timestamp)}')" class="btn btn-secondary btn-sm" title="Open this lecture in Focus Player">▶ Watch</button>` 
            : ""
          }
          <button class="btn btn-secondary btn-sm" onclick="startEditNote('${note.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteNote('${note.id}')">Delete</button>
        </div>
      </div>
      <div style="font-size: 14px; color: #333333; line-height: 1.6; white-space: pre-wrap; background: #fafafa; padding: 10px; border: 1px solid #eeeeee; border-radius: 3px;">
        ${escapeHtml(note.content)}
      </div>
    </div>
  `).join("");
}

// Export all notes as a plain text file (.txt)
function exportNotesAsText() {
  const notes = getLocalNotes();
  if (notes.length === 0) {
    alert("No notes available to export.");
    return;
  }

  let textContent = "=====================================================\n";
  textContent += "       FOCUSTUBE - STUDENT STUDY NOTES EXPORT        \n";
  textContent += "=====================================================\n\n";

  notes.forEach((note, idx) => {
    textContent += `[Note #${idx + 1}] ${note.videoTitle || "Untitled Note"}\n`;
    textContent += `Subject: ${note.subject || "General"} | Timestamp: ${note.timestamp || "N/A"}\n`;
    textContent += `Date: ${note.createdAt || "N/A"}\n`;
    textContent += `-----------------------------------------------------\n`;
    textContent += `${note.content}\n\n`;
    textContent += `=====================================================\n\n`;
  });

  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `FocusTube_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
