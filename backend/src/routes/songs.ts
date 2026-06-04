import { Router } from "express";

const router = Router();

// GET /search - Search for songs using iTunes Search API
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    // Validate query parameter
    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({ error: "q is required" });
    }

    // Encode search term and build iTunes API URL
    const encodedTerm = encodeURIComponent(q.trim());
    const itunesUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=song&limit=20`;

    // Fetch from iTunes API
    const response = await fetch(itunesUrl);
    
    if (!response.ok) {
      console.error("iTunes search failed:", response.status);
      return res.status(500).json({ error: "Search failed" });
    }

    const data = await response.json();

    // Filter and map results
    const results = data.results
      .filter((track: any) => 
        track.trackId && 
        track.trackName && 
        track.artistName && 
        track.previewUrl
      )
      .map((track: any) => ({
        externalId: String(track.trackId),
        title: track.trackName,
        artist: track.artistName,
        artworkUrl: track.artworkUrl100?.replace("100x100bb", "600x600bb") || "",
        previewUrl: track.previewUrl,
      }));

    res.json({ results });
  } catch (error) {
    console.error("Error searching songs:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;