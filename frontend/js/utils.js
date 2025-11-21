// Utility functions

function isSolvable(state) {
    let inversions = 0;
    const tiles = state.filter(t => t !== 0);
    for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] > tiles[j]) inversions++;
        }
    }
    return inversions % 2 === 0;
}

function updatePlayPauseButton() {
    pauseBtn.textContent = explorationPaused ? '▶' : '⏸';
}

// Calculate Manhattan distance (heuristic)
function manhattanDistance(state) {
    let distance = 0;
    for (let i = 0; i < state.length; i++) {
        if (state[i] !== 0) {
            const goalPos = state[i] - 1;
            const currentRow = Math.floor(i / 3);
            const currentCol = i % 3;
            const goalRow = Math.floor(goalPos / 3);
            const goalCol = goalPos % 3;
            distance += Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
        }
    }
    return distance;
}
