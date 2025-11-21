// Solver and animation logic

function shuffle() {
    // Stop any ongoing animations/solutions
    stopAllAnimations();
    
    // Reset states
    isSolving = false;
    isAnimating = false;
    lastSolutionPath = null;
    lastExplorationHistory = null;
    
    // Reset UI
    replayBtn.style.display = 'none';
    solveBtn.disabled = false;
    statusDiv.textContent = '';
    statsContainer.classList.add('hidden');
    
    // Debug: check if difficultySelect exists
    if (!difficultySelect) {
        console.error('difficultySelect is null!');
        generateRandomPuzzle();
        return;
    }
    
    const difficulty = difficultySelect.value;
    console.log('Shuffling with difficulty:', difficulty);
    
    if (difficulty === 'easy') {
        // Easy mode: generate from goal state with limited moves
        generateEasyPuzzle();
    } else {
        // Hard mode: completely random
        generateRandomPuzzle();
    }
}

function generateEasyPuzzle() {
    const maxMoves = 8; // Easy puzzles: 8-12 moves from solution
    const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let state = [...goalState];
    let lastMove = null;
    
    // Make random valid moves
    for (let i = 0; i < maxMoves + Math.floor(Math.random() * 5); i++) {
        const emptyIndex = state.indexOf(0);
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;
        const moves = [];
        
        if (row > 0) moves.push(-3); // Up
        if (row < 2) moves.push(3);  // Down
        if (col > 0) moves.push(-1); // Left
        if (col < 2) moves.push(1);  // Right
        
        // Avoid undoing the last move
        const validMoves = moves.filter(m => m !== -lastMove);
        const move = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        [state[emptyIndex], state[emptyIndex + move]] = [state[emptyIndex + move], state[emptyIndex]];
        lastMove = move;
    }
    
    // Ensure it's solvable
    if (!isSolvable(state)) {
        const nonZero = state.map((v, i) => v !== 0 ? i : -1).filter(i => i !== -1);
        [state[nonZero[0]], state[nonZero[1]]] = [state[nonZero[1]], state[nonZero[0]]];
    }
    
    currentState = state;
    renderGrid(currentState, 'grid');
    renderGrid(currentState, 'grid-exploration');
    
    // Update mode indicator
    if (shuffleModeIndicator) {
        shuffleModeIndicator.textContent = 'Mode: Easy';
        shuffleModeIndicator.style.color = '#4caf50';
    }
    
    // Show difficulty estimate
    const estDifficulty = manhattanDistance(state);
    if (difficultyHint) {
        difficultyHint.textContent = `Estimated difficulty: ${estDifficulty} moves (Easy for BFS)`;
        difficultyHint.style.color = estDifficulty <= 15 ? '#4caf50' : '#ff9800';
    }
}

function generateRandomPuzzle() {
    // Fisher-Yates shuffle for better randomization
    let attempts = 0;
    do {
        currentState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        for (let i = currentState.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentState[i], currentState[j]] = [currentState[j], currentState[i]];
        }
        attempts++;
    } while (!isSolvable(currentState) && attempts < 100);
    
    renderGrid(currentState, 'grid');
    renderGrid(currentState, 'grid-exploration');
    
    // Update mode indicator
    if (shuffleModeIndicator) {
        shuffleModeIndicator.textContent = 'Mode: Hard';
        shuffleModeIndicator.style.color = '#94a3b8';
    }
    
    // Show difficulty estimate
    const estDifficulty = manhattanDistance(currentState);
    if (difficultyHint) {
        const isBFS = algorithmSelect.value === 'bfs';
        difficultyHint.textContent = `Estimated difficulty: ${estDifficulty} moves`;
        if (isBFS) {
            difficultyHint.style.color = estDifficulty <= 15 ? '#4caf50' : estDifficulty <= 25 ? '#ff9800' : '#f44336';
            if (estDifficulty > 25) {
                difficultyHint.textContent += ' (May exceed BFS limit!)';
            }
        } else {
            difficultyHint.style.color = '#4caf50';
        }
    }
}

function stopAllAnimations() {
    isAnimating = false;
    if (solutionInterval) clearInterval(solutionInterval);
    if (explorationInterval) clearTimeout(explorationInterval);
    
    // Reset UI states
    gridExploration.style.border = '1px solid #475569';
    grid.style.border = '1px solid #475569';
    
    // Reset buttons
    pauseBtn.disabled = true;
    skipBtn.disabled = true;
    speedSelect.disabled = true;
    
    // Reset solution controls
    solutionPaused = true;
    updateSolutionControls();
}

async function solvePuzzle() {
    if (isSolving) {
        alert("Solving in progress... Please wait.");
        return;
    }

    solveBtn.disabled = true;
    replayBtn.disabled = true;
    statusDiv.textContent = 'Solving...';
    isSolving = true;

    try {
        const algorithm = algorithmSelect.value;
        
        // Get BFS limit from select if BFS is chosen
        const bfsLimit = algorithm === 'bfs' && bfsLimitSelect ? parseInt(bfsLimitSelect.value) : 10000;
        console.log(`Solving with ${algorithm}, BFS limit: ${bfsLimit}`);
        
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                state: currentState,
                algorithm: algorithm,
                max_nodes: bfsLimit
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        lastSolutionPath = result.path;
        lastExplorationHistory = result.execution_frames;
        
        console.log(`Result: ${result.nodes_explored} nodes explored, limit was ${bfsLimit}`);
        
        levelStats = calculateLevelStats(lastExplorationHistory);
        renderHistogram(levelStats);

        // Use buildTreeData which now handles worker logic internally
        buildTreeData(lastExplorationHistory);
        
        statsContainer.classList.remove('hidden');
        statNodes.textContent = result.nodes_explored;
        statTime.textContent = result.time_taken.toFixed(4) + 's';
        statPath.textContent = lastSolutionPath ? lastSolutionPath.length - 1 : 'N/A';

        if (lastSolutionPath) {
            statusDiv.textContent = `Solution found in ${lastSolutionPath.length - 1} moves!`;
        } else {
            // Special case: BFS may be cut off by the safety limit
            const bfsLimit = algorithm === 'bfs' && bfsLimitSelect ? parseInt(bfsLimitSelect.value) : 10000;
            if (algorithm === 'bfs' && result.nodes_explored >= bfsLimit) {
                statusDiv.innerHTML = `<span style="color: #ef4444; font-weight: 800; font-size: 1.1em;">⚠️ BFS STOPPED: Safety limit of ${bfsLimit.toLocaleString()} nodes reached!</span><br><span style="font-size: 0.9em">Solution hidden to prevent browser crash. Try 'Easy Mode' or increase limit.</span>`;
            } else {
                statusDiv.textContent = 'No solution found!';
            }
        }
        
        isSolving = false;
        startAnimations();

    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        solveBtn.disabled = false;
        isSolving = false;
    }
}

function updateSolutionControls() {
    if (!lastSolutionPath) {
        solPrevBtn.disabled = true;
        solNextBtn.disabled = true;
        solPlayBtn.disabled = true;
        solStepDisplay.textContent = "0/0";
        return;
    }

    solPrevBtn.disabled = solutionCurrentStep <= 0;
    solNextBtn.disabled = solutionCurrentStep >= lastSolutionPath.length - 1;
    solPlayBtn.disabled = false;
    solPlayBtn.textContent = solutionPaused ? "⏯" : "⏸";
    solStepDisplay.textContent = `${solutionCurrentStep}/${lastSolutionPath.length - 1}`;
}

function renderSolutionStep(index, animationMode = 'normal') {
    if (!lastSolutionPath || index < 0 || index >= lastSolutionPath.length) return;
    
    if (animationMode === 'skip') {
        // Instant render without animation
        renderGrid(lastSolutionPath[index].state, 'grid');
        solutionCurrentStep = index;
        updateSolutionControls();
        updateBorderColor(index);
        return;
    }
    
    // Detect which tile moved and the direction
    let movedTile = null;
    let direction = null;
    
    if (index > 0) {
        const currentState = lastSolutionPath[index].state;
        const previousState = lastSolutionPath[index - 1].state;
        
        const currentEmptyIndex = currentState.indexOf(0);
        const previousEmptyIndex = previousState.indexOf(0);
        
        if (currentEmptyIndex !== previousEmptyIndex) {
            movedTile = previousState[currentEmptyIndex];
            
            // Calculate direction
            const diff = currentEmptyIndex - previousEmptyIndex;
            if (diff === -3) direction = 'DOWN';  // Tile moved down
            else if (diff === 3) direction = 'UP';     // Tile moved up
            else if (diff === -1) direction = 'RIGHT'; // Tile moved right
            else if (diff === 1) direction = 'LEFT';   // Tile moved left
        }
    }
    
    // Animation timing based on mode
    const timings = animationMode === 'fast' 
        ? { highlight: 200, arrow: 200, move: 150 }
        : { highlight: 600, arrow: 600, move: 400 };
    
    // Stage 1: Highlight the tile that will move
    if (movedTile && index > 0) {
        renderGrid(lastSolutionPath[index - 1].state, 'grid', movedTile, 'will-move');
        
        // Stage 2: Show arrow
        setTimeout(() => {
            if (!lastSolutionPath) return;
            showMovementArrow(movedTile, direction, lastSolutionPath[index - 1].state);
            
            // Stage 3: Move the tile
            setTimeout(() => {
                if (!lastSolutionPath) return;
                removeMovementArrow();
                renderGrid(lastSolutionPath[index].state, 'grid', movedTile, 'moving');
                
                // Stage 4: Remove highlight
                setTimeout(() => {
                    if (!lastSolutionPath) return;
                    renderGrid(lastSolutionPath[index].state, 'grid');
                }, timings.move);
            }, timings.arrow);
        }, timings.highlight);
    } else {
        // No animation for first step
        renderGrid(lastSolutionPath[index].state, 'grid');
    }
    
    solutionCurrentStep = index;
    updateSolutionControls();
    updateBorderColor(index);
}

function updateBorderColor(index) {
    if (index >= lastSolutionPath.length - 1) {
        grid.style.border = '3px solid #10b981';
    } else {
        grid.style.border = '3px solid #3b82f6';
    }
}

function showMovementArrow(movedTile, direction, currentState) {
    const grid = document.getElementById('grid');
    const tileIndex = currentState.indexOf(movedTile);
    
    // Calculate position
    const row = Math.floor(tileIndex / 3);
    const col = tileIndex % 3;
    
    // Arrow symbols
    const arrows = {
        'UP': '⬆',
        'DOWN': '⬇',
        'LEFT': '⬅',
        'RIGHT': '➡'
    };
    
    const arrow = document.createElement('div');
    arrow.className = 'movement-arrow';
    arrow.id = 'movement-arrow';
    arrow.textContent = arrows[direction] || '→';
    
    // Position the arrow (approximate, needs adjustment based on grid size)
    const tileSize = 90; // ~300px / 3 tiles - gap
    const gap = 8;
    const padding = 16;
    
    let top = padding + row * (tileSize + gap) + tileSize / 2 - 24;
    let left = padding + col * (tileSize + gap) + tileSize / 2 - 24;
    
    // Offset arrow based on direction
    if (direction === 'UP') top -= 30;
    else if (direction === 'DOWN') top += 30;
    else if (direction === 'LEFT') left -= 30;
    else if (direction === 'RIGHT') left += 30;
    
    arrow.style.top = top + 'px';
    arrow.style.left = left + 'px';
    
    grid.appendChild(arrow);
}

function removeMovementArrow() {
    const arrow = document.getElementById('movement-arrow');
    if (arrow) arrow.remove();
}

function startAnimations() {
    stopAllAnimations();
    
    solveBtn.disabled = true;
    replayBtn.disabled = true;
    explorationPaused = false;
    explorationCurrentFrame = 0;
    updatePlayPauseButton();
    isAnimating = true;

    pauseBtn.disabled = false;
    skipBtn.disabled = false;
    speedSelect.disabled = false;

    // Start Exploration Animation
    if (lastExplorationHistory && lastExplorationHistory.length > 0) {
        const explorationHeader = document.querySelector('#grid-exploration').previousElementSibling;
        const originalText = explorationHeader.textContent.split(' (')[0];
        
        gridExploration.style.border = '3px solid #3b82f6';
        updateHistogramHighlight(null);
        
        function loop() {
            if (!isAnimating) return; // Stop if flag is false

            if (explorationPaused) {
                explorationInterval = setTimeout(loop, 100);
                return;
            }

            if (explorationCurrentFrame >= lastExplorationHistory.length) {
                gridExploration.style.border = '3px solid #10b981';
                explorationHeader.textContent = `${originalText} (✓ Complete)`;
                
                replayBtn.disabled = false;
                pauseBtn.disabled = true;
                skipBtn.disabled = true;
                speedSelect.disabled = true;
                
                if (lastSolutionPath) {
                    highlightSolutionPath(lastSolutionPath);
                }
                return;
            }

            const frame = lastExplorationHistory[explorationCurrentFrame];
            
            if (frame && frame.node) {
                renderGrid(frame.node, 'grid-exploration');
            }
            
            updateNodeDetails(frame);
            
            if (frame && frame.level !== undefined) {
                updateHistogramHighlight(frame.level);
            }
            
            if (frame && frame.queue_snapshot) {
                renderQueue(frame.queue_snapshot);
            }
            
            updateTree(frame);
            
            explorationHeader.textContent = `${originalText} (${explorationCurrentFrame + 1}/${lastExplorationHistory.length})`;
            
            explorationCurrentFrame++;
            explorationInterval = setTimeout(loop, explorationSpeed);
        }
        
        loop();
    }
    
    // Start Solution Animation (Auto-play by default)
    if (lastSolutionPath && lastSolutionPath.length > 0) {
        solutionCurrentStep = 0;
        solutionPaused = false;
        renderSolutionStep(0); // Show initial state
        updateSolutionControls();
        
        startSolutionAutoPlay();
    }
}

function startSolutionAutoPlay() {
    if (solutionInterval) clearInterval(solutionInterval);
    
    solutionInterval = setInterval(() => {
        if (solutionPaused) {
            clearInterval(solutionInterval);
            solutionInterval = null;
            return;
        }
        
        if (solutionCurrentStep < lastSolutionPath.length - 1) {
            renderSolutionStep(solutionCurrentStep + 1);
        } else {
            solutionPaused = true;
            updateSolutionControls();
            clearInterval(solutionInterval);
            solutionInterval = null;
        }
    }, 1800); // 1800ms for full animation cycle (600 + 600 + 400 + 200 buffer)
}


