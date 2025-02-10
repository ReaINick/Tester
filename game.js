const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const MAP_SIZE = 40000; // Map dimensions (40,000 x 40,000)
const VIEWPORT_PADDING = 100; // Extra padding for rendering outside of viewport

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
const foodCount = 5000; // Large number of food particles for a large map

function createFood() {
    return {
        position: new Vector2(Math.random() * MAP_SIZE, Math.random() * MAP_SIZE),
        radius: 5,
        color: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
    };
}

for (let i = 0; i < foodCount; i++) {
    foods.push(createFood());
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const playerCell = player.cells[0];
    const viewportX = playerCell.position.x - canvas.width / 2;
    const viewportY = playerCell.position.y - canvas.height / 2;

    // Render background grid
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(-viewportX, -viewportY, MAP_SIZE, MAP_SIZE);

    ctx.strokeStyle = '#e0e0e0';
    for (let x = -viewportX % 100; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = -viewportY % 100; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Render foods within viewport
    foods.forEach((food) => {
        const screenX = food.position.x - viewportX;
        const screenY = food.position.y - viewportY;

        if (
            screenX + food.radius > -VIEWPORT_PADDING &&
            screenX - food.radius < canvas.width + VIEWPORT_PADDING &&
            screenY + food.radius > -VIEWPORT_PADDING &&
            screenY - food.radius < canvas.height + VIEWPORT_PADDING
        ) {
            drawCircle(screenX, screenY, food.radius, food.color);
        }
    });

    // Render player cells
    player.cells.forEach((cell) => {
        const screenX = cell.position.x - viewportX;
        const screenY = cell.position.y - viewportY;
        drawCircle(screenX, screenY, cell.radius, cell.color);
    });

    requestAnimationFrame(render);
}

render();
