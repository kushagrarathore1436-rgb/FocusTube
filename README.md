# FocusTube - Distraction-Free YouTube Learning Portal
**College Mini-Project for Full Stack Web Development (B.Tech Computer Science & Engineering)**

---

## 📌 Project Overview
**FocusTube** is a distraction-free educational web application created for Indian engineering students across multiple disciplines:
* **Computer Science & IT** (DSA, DBMS, Operating Systems, Computer Networks)
* **Artificial Intelligence & Machine Learning / Data Science**
* **Electronics & Communication Engineering (ECE)** (Signals & Systems, Digital Electronics)
* **Electrical Engineering (EEE)** (Circuit Theory, Machines, Transformers)
* **Mechanical Engineering** (Thermodynamics, Fluid Mechanics)
* **Civil Engineering** (Structural Analysis, Surveying)
* **Engineering Mathematics & Basic Sciences** (Linear Algebra, Calculus, Physics)
* **GATE Exam Preparation**

FocusTube addresses the core issue of online learning: on standard YouTube, students are constantly interrupted by algorithmic recommendation sidebars, clickbait thumbnails, short-form video traps, and toxic comment sections. FocusTube provides a focused learning portal where students can search real YouTube lectures or playlists, watch them in a distraction-free player, track study sessions using a built-in **Pomodoro timer**, and take timestamped notes.

---

## 🛠️ Technology Stack

| Layer | Technology | Role in Project |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5 & Vanilla CSS3 | Semantic structure, Arial typography, plain white background, blue buttons, responsive layout |
| **Client Scripting** | Vanilla JavaScript (ES6) | DOM operations, Pomodoro timer interval, Web Audio API tone synthesis, dynamic filtering |
| **Player Integration**| Official YouTube IFrame Player API | Embeds video and playlist streams directly via official Google player without downloading or copying |
| **Client Storage** | `localStorage` | Offline-first storage for user study notes, custom playlists, and session counters |
| **Backend Server** | Node.js & Express.js | Secure REST API proxy for YouTube Data API v3, static file serving, and CORS handling |
| **Database** | MongoDB & Mongoose | Schemas for Notes, Playlists, and Student accounts (with automatic in-memory fallback) |
| **External API** | Official YouTube Data API v3 | `search.list` (videos & playlists), `videos.list` (durations & views), and `playlistItems.list` |

---

## 🔑 How to Obtain and Configure a YouTube Data API v3 Key

Google provides **10,000 free quota units per day** for the YouTube Data API v3. Follow these steps:

### Step 1: Create a Project in Google Cloud Console
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. In the top navigation bar, click the project dropdown and click **"New Project"**.
4. Name the project **"FocusTube"** and click **"Create"**.

### Step 2: Enable the YouTube Data API v3
1. In the Google Cloud Console sidebar, go to **"APIs & Services" > "Library"**.
2. In the search bar, type `YouTube Data API v3`.
3. Select **"YouTube Data API v3"** and click the blue **"Enable"** button.

### Step 3: Generate and Restrict Your API Key
1. Go to **"APIs & Services" > "Credentials"**.
2. Click **"+ Create Credentials"** at the top and select **"API Key"**.
3. A modal will appear displaying your new API key (e.g. `AIzaSy...`). Copy it.
4. *(Best Practice / Security Recommendation)* Click **"Edit API key"**:
   - **API Restrictions:** Under "API restrictions", select **"Restrict key"**, check only **"YouTube Data API v3"**, and click Save.
   - **Application Restrictions:** If using client-side testing, you can restrict by HTTP referrers (e.g. `http://localhost:3000/*`). If running purely server-side through Express, leave as "None" or restrict to server IP addresses.

### Step 4: Configure the Key in FocusTube
You have two easy ways to use your key:

* **Method A: Server-Side in `.env` (Recommended for Security):**
  Open the [.env](file:///c:/Users/VICTUS/OneDrive/Desktop/New%20ITR/.env) file in the root folder and add your key:
  ```env
  PORT=3000
  MONGODB_URI=mongodb://127.0.0.1:27017/focustube
  YOUTUBE_API_KEY=AIzaSyYourActualKeyHere
  ```
  Restart the server with `npm start`. The server will securely handle all YouTube API calls without exposing the key to the browser!

* **Method B: Frontend Interface (For Quick Viva Testing):**
  Open the homepage (`index.html`), click **"▼ YouTube Data API v3 Settings"**, paste your API key, and click **"Save Key"**. The key is saved locally in your browser's `localStorage` and sent via request headers.

---

## 🚀 How to Run FocusTube Locally

### Prerequisites
* **Node.js** (v16.0 or higher) installed on your system.

### Running the Application
1. Open a terminal in the project directory:
   ```powershell
   npm install
   ```
2. Start the Express server:
   ```powershell
   npm start
   ```
   *(or `node server.js`)*
3. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```
4. Verify all routes by running the built-in test suite:
   ```powershell
   node test-routes.js
   ```

> **Note on MongoDB:** FocusTube connects to local MongoDB (`mongodb://127.0.0.1:27017/focustube`) if running. If MongoDB is offline or not installed, the server switches to an in-memory & `localStorage` hybrid mode so **every single feature works with 100% reliability during college demonstrations**.

---

## 💡 Key Technical Features Explained for Viva

### 1. Dual Search Modes: Videos & Playlists
FocusTube supports two distinct search types using the official YouTube Data API v3:
- **Video Search (`type=video`):** Queries `search.list` for educational lectures, then calls `videos.list` to enrich cards with real durations (e.g. `24:18`) and formatted view counts (e.g. `1.8M views`).
- **Playlist Search (`type=playlist`):** Queries `search.list` with `type=playlist` to retrieve complete semester courses (NPTEL, Gate Smashers, MIT OCW). Clicking any playlist loads it into the embedded playlist player (`focus.html?list=PLAYLIST_ID`).

### 2. Multi-Branch & Subject Filtering
Students can filter lectures with one click:
- **Engineering Disciplines:** CSE, AI/ML, ECE, Electrical (EEE), Mechanical, Civil, Mathematics, GATE Preparation.
- **Subject Quick-Chips:** DSA, DBMS, Operating Systems, Computer Networks, Signals & Systems, Thermodynamics, Fluid Mechanics, Structural Analysis, Web Development.

### 3. Pagination with "Load More"
The YouTube API returns a `nextPageToken` string when additional results exist. Clicking **"Load More Results"** sends the token to the backend, appending the next 12 results seamlessly to the grid without reloading the page.

### 4. Quota Conservation & In-Memory Caching
The YouTube API has a daily limit of 10,000 units. `search.list` costs 100 units per call. FocusTube includes an in-memory cache (`youtubeCache`) in `server.js` with a 15-minute TTL. Repeated identical searches (e.g. toggling between filters) are served from server memory, saving quota units and speeding up responses.

### 5. Official YouTube IFrame Player API (`focus.html`)
The player page loads Google's official player library (`https://www.youtube.com/iframe_api`).
- Uses `new YT.Player('youtube-player', { ... })` for native iframe initialization.
- Supports both single video playback (`videoId`) and playlist playback (`listType: 'playlist', list: playlistId`).
- Handles `onError` events: If a video cannot be embedded due to content owner restrictions (Error codes 101 or 150), FocusTube displays a friendly warning banner with a direct link to watch it on YouTube.
- **Strict Compliance:** FocusTube embeds official streams directly and **does not download, copy, or rehost** any YouTube copyrighted media.

### 6. Pomodoro Focus Timer
- **25-minute Study Mode** & **5-minute Break Mode**.
- Start, Pause, and Reset controls.
- Uses HTML5 Web Audio API (`AudioContext`) to generate an audible completion tone without external `.mp3` files.
- Dynamically updates the browser tab title (`[24:50] FocusTube Study Timer`) so students see the countdown even while reading notes.

### 7. Study Notes Manager (CRUD & Text Export)
- Students can write notes with video timestamp bookmarks directly alongside the player.
- All notes support Create, Read, Update, Delete, keyword search, and an **"📥 Export as .txt"** button for offline exam revision.

---

## 🎓 Viva Questions & Answers (Examiner Preparation)

#### Q1: Which YouTube Data API v3 endpoints did you use and why?
> **Answer:** We used three key endpoints:
> 1. `search.list`: With `type=video` to find educational lecture videos and `type=playlist` to find entire course playlists.
> 2. `videos.list`: With `part=contentDetails,statistics` to fetch precise video duration (converted from ISO 8601 format like `PT15M30S` to `15:30`) and view counts.
> 3. `playlistItems.list`: To query the individual lecture videos contained inside any selected playlist.

#### Q2: How do you handle YouTube API quota limits in your application?
> **Answer:** The free tier of YouTube Data API v3 provides 10,000 units per day, and `search.list` consumes 100 units per request. To optimize this:
> 1. We implemented an in-memory caching mechanism in Express (`youtubeCache`) that stores search results for 15 minutes.
> 2. If the quota is exceeded (HTTP 403 `quotaExceeded`), the backend catches the error gracefully and the frontend switches to curated offline engineering courseware with a clear message, ensuring the application never crashes.

#### Q3: How does FocusTube play videos without violating YouTube's Terms of Service?
> **Answer:** FocusTube strictly uses the official YouTube IFrame Player API. We never scrape, download, or rehost video files on our server. The video stream is rendered directly from YouTube's servers inside an official embedded player container, which ensures content creators receive proper view counts and attribution.

#### Q4: Why did you build a backend proxy route instead of calling YouTube directly from JavaScript?
> **Answer:** In production applications, calling third-party APIs directly from browser JavaScript exposes the private API key to anyone who inspects network traffic. By routing requests through our Express backend (`/api/youtube/search`), the API key is kept secure inside `.env` on the server. The proxy also enables server-side caching and error handling.

#### Q5: What happens if a video owner disables embedding?
> **Answer:** The YouTube IFrame API triggers an `onError` event with error code 101 or 150. FocusTube listens for this event and immediately displays a polite notification banner explaining that the video owner restricted embedding, providing a direct link to open the lecture on YouTube.
