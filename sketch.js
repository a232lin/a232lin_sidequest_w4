/*
Week 4 — Example 5: Example 5: Blob Platformer (JSON + Classes)
Course: GBDA302
Instructors: Dr. Karen Cochrane and David Han
Date: Feb. 5, 2026

This file orchestrates everything:
- load JSON in preload()
- create WorldLevel from JSON
- create BlobPlayer
- update + draw each frame
- handle input events (jump, optional next level)

This matches the structure of the original blob sketch from Week 2 but moves
details into classes.
*/

let data; // raw JSON data
let levelIndex = 0;

let world; // WorldLevel instance (current level)
let player; // BlobPlayer instance

function preload() {
  // Load the level data from disk before setup runs.
  data = loadJSON("levels.json");
}

class Rock {
  constructor(platform) {
    // Place rock on top center of the platform
    this.x = platform.x + platform.w / 2;
    this.y = platform.y - 10; // slightly above platform
    this.size = 20;
  }

  draw() {
    fill(150); // grey
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size);
    rectMode(CORNER); // reset so platforms stay normal
  }

  // Check collision with blob
  checkCollision(blob) {
    const dx = Math.abs(blob.x - this.x);
    const dy = Math.abs(blob.y - this.y);
    if (dx < blob.r && dy < blob.r) {
      // blob touched rock → send back to level start
      return true;
    }
    return false;
  }
}

function setup() {
  // Create the player once (it will be respawned per level).
  player = new BlobPlayer();

  // Load the first level.
  loadLevel(0);

  // Simple shared style setup.
  noStroke();
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  // 1) Draw the world (platforms + rocks)
  world.drawWorld();

  // 2) Update the player
  player.update(world.platforms);
  player.draw(world.theme.blob);

  // 3) Check collision with rocks — THIS IS WHERE YOU PUT IT
  for (const rock of world.rocks) {
    if (rock.checkCollision(player)) {
      player.spawnFromLevel(world); // send blob back to start
    }
  }

  // 4) Check if player reached the end of last platform
  const lastPlatform = world.platforms[world.platforms.length - 1];
  const goalX = lastPlatform.x + lastPlatform.w;
  if (player.x > goalX && player.onGround) {
    const next = (levelIndex + 1) % data.levels.length; // next level
    loadLevel(next);
  }

  // 3) HUD
  fill("white");
  text(world.name, 10, 18);
  text("Move: A/D or ←/→ • Jump: Space/W/↑ • Next: N", 10, 36);
}

function keyPressed() {
  // Jump keys
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.jump();
  }

  // Optional: cycle levels with N (as with the earlier examples)
  if (key === "n" || key === "N") {
    const next = (levelIndex + 1) % data.levels.length;
    loadLevel(next);
  }
}

/*
Load a level by index:
- create a WorldLevel instance from JSON
- resize canvas based on inferred geometry
- spawn player using level start + physics
*/
function loadLevel(i) {
  levelIndex = i;

  // Create the world object from the JSON level object.
  world = new WorldLevel(data.levels[levelIndex]);

  // Fit canvas to world geometry (or defaults if needed).
  const W = world.inferWidth(640);
  const H = world.inferHeight(360);
  resizeCanvas(W, H);

  // Apply level settings + respawn.
  player.spawnFromLevel(world);
}
