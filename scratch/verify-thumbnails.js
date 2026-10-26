async function testEverything() {
  console.log("=== 1. Checking /api/youtube/status ===");
  const statusRes = await fetch("http://localhost:3000/api/youtube/status");
  const statusData = await statusRes.json();
  console.log("Status response:", statusData);
  if (!statusData.hasServerKey) throw new Error("Server key not recognized!");

  console.log("\n=== 2. Checking /api/youtube/search (Videos) ===");
  const videoRes = await fetch("http://localhost:3000/api/youtube/search?type=video&q=Computer+Science");
  const videoData = await videoRes.json();
  console.log("Is live:", videoData.isLive);
  console.log("Total items returned:", videoData.items.length);
  
  if (!videoData.items || videoData.items.length === 0) {
    throw new Error("No video items returned!");
  }

  console.log("\nFirst 3 Video Results:");
  for (let i = 0; i < Math.min(3, videoData.items.length); i++) {
    const v = videoData.items[i];
    console.log(`[${i+1}] ${v.title}`);
    console.log(`    Channel: ${v.channel}`);
    console.log(`    Thumbnail: ${v.thumbnailUrl}`);
    console.log(`    isSample: ${v.isSample}`);
  }

  console.log("\n=== 3. Testing Real Image Download for Live Videos ===");
  for (let i = 0; i < Math.min(5, videoData.items.length); i++) {
    const v = videoData.items[i];
    const imgRes = await fetch(v.thumbnailUrl);
    const buf = await imgRes.arrayBuffer();
    console.log(`Thumb ${i+1}: HTTP ${imgRes.status}, size=${buf.byteLength} bytes (Grey 3-dots check: ${buf.byteLength === 1097 ? 'FAILED (3-dots)' : 'PASSED (Real image)'})`);
    if (buf.byteLength === 1097) {
      throw new Error(`Thumbnail for ${v.title} returned YouTube's 1097-byte 3-dots placeholder!`);
    }
  }

  console.log("\n=== 4. Checking /api/youtube/search (Playlists) ===");
  const plRes = await fetch("http://localhost:3000/api/youtube/search?type=playlist&q=Data+Structures");
  const plData = await plRes.json();
  console.log("Is live playlists:", plData.isLive);
  console.log("Total playlists:", plData.items.length);
  if (plData.items.length > 0) {
    console.log("First playlist title:", plData.items[0].title);
    console.log("First playlist thumb:", plData.items[0].thumbnailUrl);
    console.log("First playlist isSample:", plData.items[0].isSample);
  }

  console.log("\n=== 5. Checking Fallback SVG Access ===");
  const svgRes = await fetch("http://localhost:3000/images/thumbnail-fallback.svg");
  console.log("SVG Fallback HTTP status:", svgRes.status, "Content-Type:", svgRes.headers.get("content-type"));
  if (svgRes.status !== 200) throw new Error("Fallback SVG not accessible!");

  console.log("\n ALL AUTOMATED THUMBNAIL & API CHECKS PASSED SUCCESSFULLY!");
}

testEverything().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
