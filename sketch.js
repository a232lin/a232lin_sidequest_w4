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
    this.size = 20; // controls width/height of fire
  }

  draw() {
    fill("#ff3b3b"); // fire colour
    noStroke();
    beginShape();
    // Draw a simple flame shape using 5 points
    vertex(this.x, this.y - this.size); // top point
    vertex(this.x - this.size * 0.5, this.y); // bottom left
    vertex(this.x - this.size * 0.2, this.y * 0.9 + this.size * 0.2);
    vertex(this.x + this.size * 0.2, this.y * 0.9 + this.size * 0.2);
    vertex(this.x + this.size * 0.5, this.y); // bottom right
    endShape(CLOSE);
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
  // 1) Draw the world (background + platforms)
  world.drawWorld();

  // 2) Update and draw the player
  player.update(world.platforms);
  player.draw(world.theme.blob);

  // --- 2a) Check if blob fell off screen ---
  if (player.y - player.r > height) {
    loadLevel(0); // send back to level 1
  }

  // --- 2b) Check collision with rocks ---
  for (const rock of world.rocks) {
    if (rock.checkCollision(player)) {
      player.spawnFromLevel(world); // reset current level
    }
  }

  // --- 3) Check if player reached the goal platform ← PUT THE CODE HERE ---
  const goalIndex = world.goalPlatformIndex ?? world.platforms.length - 1;
  const goalPlatform = world.platforms[goalIndex];

  // Horizontal check
  const onGoalX = player.x + player.r >= width;

  // Vertical check (allows blob slightly above platform)
  const onGoalY =
    player.y + player.r >= goalPlatform.y - 300 &&
    player.y - player.r <= goalPlatform.y + goalPlatform.h;

  // Advance level if on goal platform
  if (onGoalX && onGoalY) {
    const next = (levelIndex + 1) % data.levels.length;
    loadLevel(next);
  }

  // 4) HUD
  fill("white");
  text(world.name, 10, 18);
  text("Move: A/D or ←/→ • Jump: Space/W/↑", 10, 36);
}

function keyPressed() {
  // Jump keys
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.jump();
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
