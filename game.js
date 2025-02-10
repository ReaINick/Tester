const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAP_SIZE = 40000; // Map dimensions (40,000 x 40,000)
const VIEWPORT_PADDING = 100; // Extra padding for rendering outside of viewport
let zoomLevel = 1;        // Initial zoom level
const ZOOM_SPEED = 0.001;  // Zoom speed
const MIN_ZOOM = 0.1;      // Minimum zoom level
const MAX_ZOOM = 5;        // Maximum zoom level

// Player object
const player = {
    cells: [
        {
            position: new Vector2(MAP_SIZE / 2, MAP_SIZE / 2),
            velocity: new Vector2(0, 0),
            radius: 50,
            color: 'blue'
        }
    ],
    speed: 3,
    score: 0
};

// Food array
const foods = [];
const foodCount = 5000; // Large number of food particles for a large map

// Viruses array
const viruses = [];
const virusCount = 50;

// Function to create food
function createFood() {
    return {
        position: new Vector2(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE),
        radius: 5,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
    };
}

// Function to create virus
function createVirus() {
    return {
        position: new Vector2(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE),
        radius: 30,
        image: imageResizer.images['virus'], // Use preloaded virus image
        color: 'green',
        isEjected: false
    };
}

// Initialize food and virus arrays
for (let i = 0; i < foodCount; i++) {
    foods.push(createFood());
}

for (let i = 0; i < virusCount; i++) {
    viruses.push(createVirus());
}

// Function to draw circle
function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

// Function to draw image
function drawImage(image, x, y, width, height) {
    ctx.drawImage(image, x, y, width, height);
}

// Function to handle zoom
function handleZoom(event) {
    zoomLevel += event.deltaY * ZOOM_SPEED;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel)); // Clamp zoom level
}

// Function to render the game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate viewport based on player's position and zoom level
    const playerCell = player.cells[0];
    const viewportX = playerCell.position.x - (canvas.width / 2) / zoomLevel;
    const viewportY = playerCell.position.y - (canvas.height / 2) / zoomLevel;

    // Save the current transformation matrix
    ctx.save();

    // Apply zoom and translate context
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-viewportX, -viewportY);

    // Render background grid
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(viewportX, viewportY, MAP_SIZE, MAP_SIZE);

    ctx.strokeStyle = '#e0e0e0';
    for (let x = viewportX - (viewportX % 100); x < viewportX + canvas.width / zoomLevel; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, viewportY);
        ctx.lineTo(x, viewportY + canvas.height / zoomLevel);
        ctx.stroke();
    }
    for (let y = viewportY - (viewportY % 100); y < viewportY + canvas.height / zoomLevel; y += 100) {
        ctx.beginPath();
        ctx.moveTo(viewportX, y);
        ctx.lineTo(viewportX + canvas.width / zoomLevel, y);
        ctx.stroke();
    }

    // Collision and consumption logic
    foods.forEach((food, index) => {
        const distanceVector = playerCell.position.minusNew(food.position);
        const distance = distanceVector.magnitude();

        if (distance < playerCell.radius + food.radius) {
            playerCell.radius += food.radius / 10;
            player.score += 10;
            scoreElement.textContent = player.score;
            foods.splice(index, 1);
            foods.push(createFood()); // Respawn food
        }
    });

    // Render foods
    foods.forEach((food) => {
        const screenX = food.position.x;
        const screenY = food.position.y;
        drawCircle(screenX, screenY, food.radius, food.color);
    });

    viruses.forEach((virus) => {
        const screenX = virus.position.x;
        const screenY = virus.position.y;
        drawImage(virus.image, screenX - virus.radius, screenY - virus.radius, virus.radius * 2, virus.radius * 2);
    });

    // Render player cells
    player.cells.forEach((cell) => {
        const screenX = cell.position.x;
        const screenY = cell.position.y;
        drawCircle(screenX, screenY, cell.radius, cell.color);
    });

    // Restore the transformation matrix
    ctx.restore();

    requestAnimationFrame(render);
}

// Event listener for zoom
canvas.addEventListener('wheel', handleZoom);

// Start rendering
imageResizer.loadImages(['virus', 'recombine']).then(() => {
    render();
});
