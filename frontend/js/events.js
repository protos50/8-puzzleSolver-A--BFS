// Event listeners setup

function initializeEventListeners() {
    // Main controls
    shuffleBtn.addEventListener('click', shuffle);
    solveBtn.addEventListener('click', solvePuzzle);
    
    // Difficulty change - update mode indicator
    difficultySelect.addEventListener('change', () => {
        const mode = difficultySelect.value;
        if (shuffleModeIndicator) {
            shuffleModeIndicator.textContent = mode === 'easy' ? 'Mode: Easy' : 'Mode: Hard';
            shuffleModeIndicator.style.color = mode === 'easy' ? '#4caf50' : '#94a3b8';
        }
    });
    replayBtn.addEventListener('click', startAnimations);

    // Animation controls
    pauseBtn.addEventListener('click', () => {
        explorationPaused = !explorationPaused;
        updatePlayPauseButton();
    });

    skipBtn.addEventListener('click', () => {
        explorationCurrentFrame = lastExplorationHistory.length;
    });

    speedSelect.addEventListener('change', (e) => {
        explorationSpeed = parseInt(e.target.value);
    });

    // Algorithm change - show/hide BFS controls
    algorithmSelect.addEventListener('change', () => {
        const isBFS = algorithmSelect.value === 'bfs';
        if (bfsControlsDiv) {
            bfsControlsDiv.style.display = isBFS ? 'flex' : 'none';
        }
    });

    // Modal controls
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // Tree controls
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            const container = document.getElementById('tree-container');
            const svgElement = d3.select(container).select('svg');
            svgElement.transition().call(zoom.scaleBy, 1.3);
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            const container = document.getElementById('tree-container');
            const svgElement = d3.select(container).select('svg');
            svgElement.transition().call(zoom.scaleBy, 0.7);
        });
    }

    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            if (typeof resetTreeZoom === 'function') {
                resetTreeZoom();
            } else {
                // Fallback
                const container = document.getElementById('tree-container');
                const svgElement = d3.select(container).select('svg');
                svgElement.transition().call(zoom.transform, d3.zoomIdentity);
            }
        });
    }

    if (toggleGridBtn) {
        toggleGridBtn.addEventListener('click', () => {
            toggleTreeGrid();
            toggleGridBtn.classList.toggle('active');
        });
    }

    if (fullscreenBtn && treeSection) {
        fullscreenBtn.addEventListener('click', () => {
            treeSection.classList.toggle('fullscreen');
            fullscreenBtn.textContent = treeSection.classList.contains('fullscreen') ? '⛶ Exit' : '⛶';
            
            setTimeout(() => {
                if (typeof resizeTree === 'function') {
                    resizeTree();
                } else {
                    // Fallback
                    const container = document.getElementById('tree-container');
                    const width = container.clientWidth;
                    const height = container.clientHeight;
                    
                    if (svg) {
                        svg.attr('width', width).attr('height', height);
                    }
                }
            }, 100);
        });
    }

    // Solution Controls
    if (solPrevBtn) {
        solPrevBtn.addEventListener('click', () => {
            // Stop auto-play immediately
            solutionPaused = true;
            if (solutionInterval) {
                clearInterval(solutionInterval);
                solutionInterval = null;
            }
            
            // Move to previous step with fast animation
            if (solutionCurrentStep > 0) {
                renderSolutionStep(solutionCurrentStep - 1, 'fast');
            }
        });
    }

    if (solNextBtn) {
        solNextBtn.addEventListener('click', () => {
            // Stop auto-play immediately
            solutionPaused = true;
            if (solutionInterval) {
                clearInterval(solutionInterval);
                solutionInterval = null;
            }
            
            // Move to next step with fast animation
            if (lastSolutionPath && solutionCurrentStep < lastSolutionPath.length - 1) {
                renderSolutionStep(solutionCurrentStep + 1, 'fast');
            }
        });
    }

    if (solPlayBtn) {
        solPlayBtn.addEventListener('click', () => {
            if (!lastSolutionPath) return;
            
            // Toggle play/pause
            solutionPaused = !solutionPaused;
            updateSolutionControls();
            
            if (!solutionPaused) {
                // If at end, restart from beginning
                if (solutionCurrentStep >= lastSolutionPath.length - 1) {
                    renderSolutionStep(0);
                }
                
                // Start auto-play using the shared function
                startSolutionAutoPlay();
            } else {
                // Paused, clear interval
                if (solutionInterval) {
                    clearInterval(solutionInterval);
                    solutionInterval = null;
                }
            }
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing...");
    initializeEventListeners();
    
    // Initialize BFS controls visibility based on current selection
    if (bfsControlsDiv && algorithmSelect) {
        const isBFS = algorithmSelect.value === 'bfs';
        bfsControlsDiv.style.display = isBFS ? 'flex' : 'none';
    }
    
    // Initialize mode indicator based on difficulty selector
    if (shuffleModeIndicator && difficultySelect) {
        const mode = difficultySelect.value;
        shuffleModeIndicator.textContent = mode === 'easy' ? 'Mode: Easy' : 'Mode: Hard';
        shuffleModeIndicator.style.color = mode === 'easy' ? '#4caf50' : '#94a3b8';
    }
    
    shuffle();
});
