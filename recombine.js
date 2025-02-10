function applyRecombinePowerUp() {
    const totalMass = player.cells.reduce((sum, cell) => sum + Math.PI * cell.radius * cell.radius, 0);
    const newRadius = Math.sqrt(totalMass / Math.PI);

    player.cells = [
        {
            position: player.cells[0].position.clone(),
            velocity: new Vector2(0, 0),
            radius: newRadius,
            color: 'blue'
        }
    ];
}
