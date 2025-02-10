function applyVirusPowerUp() {
    const newCells = [];

    player.cells.forEach((cell) => {
        if (cell.radius >= 50) {
            const splitCount = Math.floor(cell.radius / 50);
            const angleStep = (Math.PI * 2) / splitCount;

            for (let i = 0; i < splitCount; i++) {
                const angle = i * angleStep;
                const velocity = new Vector2(Math.cos(angle), Math.sin(angle)).multiplyEq(5);

                newCells.push({
                    position: cell.position.clone(),
                    velocity,
                    radius: cell.radius / splitCount,
                    color: 'blue'
                });
            }
        } else {
            newCells.push(cell); // Keep small cells unchanged
        }
    });

    player.cells = newCells;
}
