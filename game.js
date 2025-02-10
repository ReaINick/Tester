const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const player = {
    cells: [
        {
            position: new Vector2(canvas.width / 2, canvas.height / 2),
            velocity: new Vector2(0, 0),
            radius: 20,
            color: 'blue'
        }
    ],
    speed: 3,
    score: 0
};

const foods = [];
const foodCount = 100;
const friction = 0.98;
const acceleration = 0.5;

function createFood() {
    return {
        position: new Vector2(Math.random() * canvas.width, Math.random() * canvas.height),
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

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function splitCell(cell) {
    if (cell.radius < 40) return; // Minimum size to split

    const newRadius = cell.radius / Math.sqrt(2);
    const newCell = {
        position: cell.position.clone(),
        velocity: cell.velocity.clone().multiplyEq(2), // Eject with double speed
        radius: newRadius,
        color: cell.color
    };

    cell.radius = newRadius;
    player.cells.push(newCell);
}

function ejectMass(cell) {
    if (cell.radius < 30) return; // Minimum size to eject mass

    const ejectedMass = {
        position: cell.position.clone(),
        velocity: cell.velocity.clone().normalise().multiplyEq(10), // Eject in the direction of movement
        radius: 10,
        color: cell.color
    };

    cell.radius -= 5;
    foods.push(ejectedMass);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let direction = new Vector2(0, 0);
    if (keys.ArrowUp) direction.y -= 1;
    if (keys.ArrowDown) direction.y += 1;
    if (keys.ArrowLeft) direction.x -= 1;
    if (keys.ArrowRight) direction.x += 1;

    if (keys.KeyG) {
        player.cells.forEach(splitCell);
        keys.KeyG = false; // Prevent continuous splitting
    }

    if (keys.KeyX) {
        player.cells.forEach(ejectMass);
        keys.KeyX = false; // Prevent continuous ejection
    }

    player.cells.forEach(cell => {
        if (direction.magnitude() > 0) {
            direction.normalise().multiplyEq(acceleration);
            cell.velocity.plusEq(direction);
        }

        cell.velocity.multiplyEq(friction);
        cell.position.plusEq(cell.velocity);

        // Boundary collision
        if (cell.position.x - cell.radius < 0 || cell.position.x + cell.radius > canvas.width) {
            cell.velocity.x *= -0.8;
            cell.position.x = Math.max(cell.radius, Math.min(canvas.width - cell.radius, cell.position.x));
        }
        if (cell.position.y - cell.radius < 0 || cell.position.y + cell.radius > canvas.height) {
            cell.velocity.y *= -0.8;
            cell.position.y = Math.max(cell.radius, Math.min(canvas.height - cell.radius, cell.position.y));
        }

        drawCircle(cell.position.x, cell.position.y, cell.radius, cell.color);
    });

    foods.forEach((food, index) => {
        drawCircle(food.position.x, food.position.y, food.radius, food.color);

        player.cells.forEach(cell => {
            const distanceVector = cell.position.minusNew(food.position);
            const distance = distanceVector.magnitude();

            if (distance < cell.radius + food.radius) {
                cell.radius += food.radius / 10;
                player.score += 10;
                scoreElement.textContent = player.score;
                foods.splice(index, 1);
                foods.push(createFood());
            }
        });
    });

    player.speed = 5 / Math.sqrt(player.cells[0].radius);

    requestAnimationFrame(update);
}

update();
