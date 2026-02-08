/*
WorldLevel.js (Example 5)

WorldLevel wraps ONE level object from levels.json and provides:
- Theme colours (background/platform/blob)
- Physics parameters that influence the player (gravity, jump velocity)
- Spawn position for the player (start)
- An array of Platform instances
- A couple of helpers to size the canvas to fit the geometry

This is directly inspired by your original blob sketch’s responsibilities: 
- parse JSON
- map platforms array
- apply theme + physics
- infer canvas size

Expected JSON shape for each level (from your provided file): 
{
  "name": "Intro Steps",
  "gravity": 0.65,
  "jumpV": -11.0,
  "theme": { "bg":"...", "platform":"...", "blob":"..." },
  "start": { "x":80, "y":220, "r":26 },
  "platforms": [ {x,y,w,h}, ... ]
}
*/

class WorldLevel {
  constructor(levelJson) {
    // A readable label for HUD.
    this.name = levelJson.name || "Level";

    // Theme defaults + override with JSON.
    this.theme = Object.assign(
      { bg: "#613a26", platform: "#8bc44f", blob: "#cd9e77" },
      levelJson.theme || {},
    );

    // Physics knobs (the blob player will read these).
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Player spawn data.
    // Use optional chaining so levels can omit fields safely.
    this.start = {
      x: levelJson.start?.x ?? 80,
      y: levelJson.start?.y ?? 180,
      r: levelJson.start?.r ?? 26,
    };

    // Convert raw platform objects into Platform instances.
    this.platforms = (levelJson.platforms || []).map((p) => new Platform(p));
    this.rocks = [];
    if (levelJson.rocks) {
      for (const r of levelJson.rocks) {
        const plat = this.platforms[r.platformIndex];
        if (plat) this.rocks.push(new Rock(plat));
      }
    }
  }

  /*
  If you want the canvas to fit the world, you can infer width/height by
  finding the maximum x+w and y+h across all platforms.
  */
  inferWidth(defaultW = 640) {
    if (!this.platforms.length) return defaultW;
    return max(this.platforms.map((p) => p.x + p.w));
  }

  inferHeight(defaultH = 360) {
    if (!this.platforms.length) return defaultH;
    return max(this.platforms.map((p) => p.y + p.h));
  }

  /*
  Draw only the world (background + platforms).
  The player draws itself separately, after the world is drawn.
  */
  drawWorld() {
    // 1) Background
    background(color(this.theme.bg));

    // 2) Dirt lines ONLY for level 1
    if (levelIndex === 0) {
      stroke("#4b2f1f"); // dark brown
      strokeWeight(2);
      for (let y = 0; y < height; y += 20) {
        line(0, y + random(-5, 5), width, y + random(-5, 5));
      }
      noStroke();
    }

    // 3) Draw platforms
    for (const p of this.platforms) {
      p.draw(color(this.theme.platform));
    }

    // 4) Draw rocks on top of platforms
    for (const r of this.rocks) {
      r.draw();
    }
  }
}
