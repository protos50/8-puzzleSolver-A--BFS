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
