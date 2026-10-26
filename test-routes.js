// Automated Route & Endpoint Tester for FocusTube with YouTube Data API v3
const http = require("http");

const paths = [
  "/",
  "/index.html",
  "/focus.html?v=8hly31xKli0",
  "/focus.html?list=PLxCzCOWd7aiFAN6I8C9XdK_KVdQ50KN2v",
  "/watch.html?v=8hly31xKli0",
  "/notes.html",
  "/playlists.html",
  "/login.html",
  "/css/style.css",
  "/js/sample-data.js",
  "/js/common.js",
  "/js/main.js",
  "/js/player.js",
  "/js/notes.js",
  "/js/playlists.js",
  "/js/auth.js",
  "/api/health",
  "/api/videos",
  "/api/notes",
  "/api/playlists",
  "/api/youtube/status",
  "/api/youtube/search?type=video",
  "/api/youtube/search?type=playlist"
];

let failed = 0;

function checkPath(path) {
  return new Promise(resolve => {
    http.get("http://localhost:3000" + path, res => {
      // 200 or 302 redirect (for watch.html or static) are valid
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log("PASS: [" + res.statusCode + "] " + path);
      } else {
        console.error("FAIL: [" + res.statusCode + "] " + path);
        failed++;
      }
      resolve();
    }).on("error", err => {
      console.error("ERROR: " + path + " -> " + err.message);
      failed++;
      resolve();
    });
  });
}

async function run() {
  console.log("Starting FocusTube Comprehensive Route Verification...\n");
  for (const p of paths) {
    await checkPath(p);
  }
  console.log("\n=================================");
  console.log("Total tests: " + paths.length + ", Failed: " + failed);
  console.log("=================================");
  process.exit(failed > 0 ? 1 : 0);
}

run();
