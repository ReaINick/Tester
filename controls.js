const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function updatePlayerMovement() {
    let direction = new Vector2(0, 0);

    if (keys.ArrowUp) direction.y -= 1;
    if (keys.ArrowDown) direction.y += 1;
    if (keys.ArrowLeft) direction.x -= 1;
    if (keys.ArrowRight) direction.x += 1;

    if (direction.magnitude() > 0) {
        direction.normalise().multiplyEq(player.speed);
        player.cells.forEach((cell) => {
            cell.velocity.plusEq(direction);
            cell.position.plusEq(cell.velocity);
            cell.velocity.multiplyEq(0.9); // Apply friction
        });
    }
}

setInterval(updatePlayerMovement, 16); // Update movement every frame
