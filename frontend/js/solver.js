// Solver and animation logic

async function solvePuzzle() {
    solveBtn.disabled = true;
    replayBtn.disabled = true;
    statusDiv.textContent = 'Solving...';

    try {
        const algorithm = algorithmSelect.value;
        
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                state: currentState,
                algorithm: algorithm 
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        lastSolutionPath = result.path;
        lastExplorationHistory = result.execution_frames;
        
        levelStats = calculateLevelStats(lastExplorationHistory);
        renderHistogram(levelStats);

        treeData = buildTreeData(lastExplorationHistory);
        initializeTree(treeData);
        
        statsContainer.classList.remove('hidden');
        statNodes.textContent = result.nodes_explored;
        statTime.textContent = result.time_taken.toFixed(4) + 's';
        statPath.textContent = lastSolutionPath ? lastSolutionPath.length - 1 : 'N/A';

        if (lastSolutionPath) {
            statusDiv.textContent = `Solution found in ${lastSolutionPath.length - 1} moves!`;
        } else {
            statusDiv.textContent = 'No solution found!';
        }
        
        startAnimations();

    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        solveBtn.disabled = false;
    }
}

function startAnimations() {
    if (solutionInterval) clearInterval(solutionInterval);
    if (explorationInterval) clearTimeout(explorationInterval);
    
    solveBtn.disabled = true;
    replayBtn.disabled = true;
    explorationPaused = false;
    explorationCurrentFrame = 0;
    updatePlayPauseButton();

    pauseBtn.disabled = false;
    skipBtn.disabled = false;
    speedSelect.disabled = false;

    if (lastExplorationHistory && lastExplorationHistory.length > 0) {
        const explorationHeader = document.querySelector('#grid-exploration').previousElementSibling;
        const originalText = explorationHeader.textContent.split(' (')[0];
        
        gridExploration.style.border = '3px solid #3b82f6';
        
        updateHistogramHighlight(null);
        
        function loop() {
            if (explorationPaused) {
                setTimeout(loop, 100);
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
            setTimeout(loop, explorationSpeed);
        }
        
        loop();
    }
    
    if (lastSolutionPath && lastSolutionPath.length > 0) {
        let i = 0;
        solutionInterval = setInterval(() => {
            if (i >= lastSolutionPath.length) {
                clearInterval(solutionInterval);
                grid.style.border = '3px solid #10b981';
                return;
            }
            
            renderGrid(lastSolutionPath[i].state, 'grid');
            i++;
        }, 500);
    }
}

function shuffle() {
    let newState;
    do {
        newState = [...currentState].sort(() => Math.random() - 0.5);
    } while (!isSolvable(newState));
    
    currentState = newState;
    renderGrid(currentState, 'grid');
    renderGrid(currentState, 'grid-exploration');
    statusDiv.textContent = 'Shuffled!';
    solveBtn.disabled = false;
    replayBtn.disabled = true;
    statsContainer.classList.add('hidden');
    updateNodeDetails(null);
    
    if (solutionInterval) clearInterval(solutionInterval);
    if (explorationInterval) clearInterval(explorationInterval);
}
