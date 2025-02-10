const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAP_SIZE = 40000;
const VIEWPORT_PADDING = 100;
let zoomLevel = 1;
const ZOOM_SPEED = 0.001;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

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

const foods = [];
const foodCount = 5000;

const viruses = [];
const virusCount = 50;

function createFood() {
    return {
        position: new Vector2(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE),
        radius: 5,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
    };
}

function createVirus() {
    return {
        position: new Vector2(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE),
        radius: 30,
        image: imageResizer.images['virus'], // Use preloaded virus image
        color: 'green',
        isEjected: false
    };
}

for (let i = 0; i < foodCount; i++) {
    foods.push(createFood());
}

for (let i = 0; i < virusCount; i++) {
    viruses.push(createVirus());
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawImage(image, x, y, width, height) {
    ctx.drawImage(image, x, y, width, height);
}

function handleZoom(event) {
    zoomLevel += event.deltaY * ZOOM_SPEED;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
}

// Function to split cell into smaller cells
function splitCell(cell) {
    const splitCount = Math.floor(Math.random() * 5) + 3; // Split into 3-7 pieces
    const angleStep = (Math.PI * 2) / splitCount;
    const newCells = [];

    for (let i = 0; i < splitCount; i++) {
        const angle = i * angleStep;
        const velocity = new Vector2(Math.cos(angle), Math.sin(angle)).multiplyEq(5);
        const newRadius = cell.radius / Math.sqrt(splitCount);

        newCells.push({
            position: cell.position.clone(),
            velocity: velocity,
            radius: newRadius,
            color: cell.color
        });
    }
    return newCells;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const playerCell = player.cells[0];
    const viewportX = playerCell.position.x - (canvas.width / 2) / zoomLevel;
    const viewportY = playerCell.position.y - (canvas.height / 2) / zoomLevel;

    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-viewportX, -viewportY);

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

    foods.forEach((food, index) => {
        const distanceVector = playerCell.position.minusNew(food.position);
        const distance = distanceVector.magnitude();

        if (distance < playerCell.radius + food.radius) {
            playerCell.radius += food.radius / 10;
            player.score += 10;
            scoreElement.textContent = player.score;
            foods.splice(index, 1);
            foods.push(createFood());
        }
    });

    viruses.forEach((virus, index) => {
        player.cells.forEach((cell) => {
            const distanceVector = cell.position.minusNew(virus.position);
            const distance = distanceVector.magnitude();

            if (distance < cell.radius + virus.radius) {
                if (cell.radius > virus.radius * 1.2) {
                    // Player cell is larger, split it
                    const newCells = splitCell(cell);
                    player.cells = player.cells.concat(newCells); // Add new cells
                    player.cells.splice(player.cells.indexOf(cell), 1); // Remove original cell
                    viruses.splice(index, 1);
                    viruses.push(createVirus());
                } else {
                    // Player cell is smaller, consume it
                    player.score -= 50;
                    scoreElement.textContent = player.score;
                    player.cells.splice(player.cells.indexOf(cell), 1);
                    virus.radius += cell.radius / 2;
                    viruses.splice(index, 1);
                    viruses.push(createVirus());
                }
            }
        });
    });

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

    player.cells.forEach((cell) => {
        const screenX = cell.position.x;
        const screenY = cell.position.y;
        drawCircle(screenX, screenY, cell.radius, cell.color);
    });

    ctx.restore();

    requestAnimationFrame(render);
}

canvas.addEventListener('wheel', handleZoom);

imageResizer.loadImages(['virus', 'recombine']).then(() => {
    render();
});
