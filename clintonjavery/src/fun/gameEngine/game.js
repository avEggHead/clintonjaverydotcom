// Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bunny = {
  x: 100,
  y: canvas.height - 70, // Start closer to the bottom
  width: 50,
  height: 50,
  speed: 10,
  jumping: false,
  ducking: false,
};

const gravity = 4; // Increased gravity to make falling faster
const jumpHeight = 10;
const obstacleWidth = 50; // Width of obstacles
const obstacleHeight = 50; // Height of obstacles
const obstacleSpeed = 2; // Speed at which obstacles move leftward
let obstacles = []; // Array to hold obstacles
let score = 0; // Score to track how many obstacles avoided

// Button event listeners
document.getElementById("jumpBtn").addEventListener("click", () => {
  if (!bunny.jumping) {
    bunny.jumping = true;
    bunny.y -= jumpHeight; // Move bunny up when jump is triggered
    console.log("Jumping...");
  }
});

document.getElementById("duckBtn").addEventListener("click", () => {
  bunny.ducking = !bunny.ducking; // Toggle ducking state
  console.log(bunny.ducking ? "Ducking..." : "Standing...");
});

// Function to generate new obstacles
function generateObstacle() {
  const yPosition = canvas.height - obstacleHeight; // Obstacles appear at the bottom
  const xPosition = canvas.width; // Start at the right side
  obstacles.push({ x: xPosition, y: yPosition, width: obstacleWidth, height: obstacleHeight });
}

// Game loop
function gameLoop() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update bunny position if jumping
  if (bunny.jumping) {
    bunny.y -= jumpHeight;
    if (bunny.y <= canvas.height - 75) { // Peak of the jump
      setTimeout(() => {
        bunny.jumping = false; // Stop jumping after reaching peak
      }, 250);
    }
  } else {
    if (bunny.y < canvas.height - 70) { // Apply gravity (make it fall faster)
      bunny.y += gravity;
    }
  }

  // Render bunny (ducking or standing)
  ctx.fillStyle = bunny.ducking ? "green" : "brown";
  ctx.fillRect(bunny.x, bunny.y, bunny.width, bunny.height);

  // Move obstacles and check for collision
  obstacles.forEach((obstacle, index) => {
    obstacle.x -= obstacleSpeed; // Move obstacle to the left
    ctx.fillStyle = "red"; // Obstacles are red
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    // Collision detection
    if (
      bunny.x < obstacle.x + obstacle.width &&
      bunny.x + bunny.width > obstacle.x &&
      bunny.y < obstacle.y + obstacle.height &&
      bunny.y + bunny.height > obstacle.y
    ) {
      // If there's a collision, end the game
      gameOver();
    }

    // Remove obstacles that go off the screen
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
      score += 1; // Increase score for each obstacle avoided
    }
  });

  // Render the score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Function to end the game
function gameOver() {
  alert("Game Over! Final Score: " + score);
  obstacles = []; // Clear obstacles
  score = 0; // Reset score
  bunny.y = canvas.height - 70; // Reset bunny position
  gameLoop(); // Restart the game loop
}

// Start the game loop
gameLoop();

// Generate new obstacles every 2 seconds
setInterval(generateObstacle, 2000);
