const grid = document.getElementById('grid');
const gridExploration = document.getElementById('grid-exploration');
const shuffleBtn = document.getElementById('shuffle-btn');
const solveBtn = document.getElementById('solve-btn');
const replayBtn = document.getElementById('replay-btn');
const algorithmSelect = document.getElementById('algorithm-select');
const statusDiv = document.getElementById('status');
const statsContainer = document.getElementById('stats-container');
const statNodes = document.getElementById('stat-nodes');
const statTime = document.getElementById('stat-time');
const statPath = document.getElementById('stat-path');

let currentState = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents empty tile
let lastSolutionPath = null;
let lastExplorationHistory = null;
let solutionInterval = null;
let explorationInterval = null;
let explorationPaused = false;
let explorationCurrentFrame = 0;
let explorationSpeed = 200; // ms per frame

// Speed control elements
const pauseBtn = document.getElementById('pause-btn');
const skipBtn = document.getElementById('skip-btn');
const speedSelect = document.getElementById('speed-select');

function renderGrid(state, elementId, highlightTile = null) {
    const grid = document.getElementById(elementId);
    grid.innerHTML = '';
    state.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = tile === 0 ? 'tile empty' : 'tile';
        tileDiv.textContent = tile === 0 ? '' : tile;
        
        if (tile === highlightTile && tile !== 0) {
            tileDiv.classList.add('highlight');
        }
        
        grid.appendChild(tileDiv);
    });
}

function updateNodeDetails(frame) {
    if (!frame) {
        document.getElementById('detail-step').textContent = '-';
        document.getElementById('detail-level').textContent = '-';
        document.getElementById('detail-action').textContent = '-';
        return;
    }
    document.getElementById('detail-step').textContent = frame.step || '-';
    document.getElementById('detail-level').textContent = frame.level !== undefined ? frame.level : '-';
    document.getElementById('detail-action').textContent = frame.action || 'Start';
    
    // Sprint 6: A* Specifics
    const fScore = document.getElementById('detail-f-score');
    const gScore = document.getElementById('detail-g-score');
    const hScore = document.getElementById('detail-h-score');
    const astarItems = document.querySelectorAll('.astar-only');
    
    if (frame.f_score !== undefined) {
        // Show A* details
        astarItems.forEach(item => item.classList.remove('hidden'));
        if (fScore) fScore.textContent = frame.f_score;
        if (gScore) gScore.textContent = frame.g_score;
        if (hScore) hScore.textContent = frame.h_score;
    } else {
        // Hide A* details
        astarItems.forEach(item => item.classList.add('hidden'));
    }
}

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

function shuffle() {
    let newState;
    do {
        newState = [...currentState].sort(() => Math.random() - 0.5);
    } while (!isSolvable(newState));
    
    currentState = newState;
    renderGrid(currentState, 'grid');
    renderGrid(currentState, 'grid-exploration'); // Reset exploration grid too
    statusDiv.textContent = 'Shuffled!';
    solveBtn.disabled = false;
    replayBtn.disabled = true;
    statsContainer.classList.add('hidden');
    updateNodeDetails(null);
    
    // Clear any running animations
    if (solutionInterval) clearInterval(solutionInterval);
    if (explorationInterval) clearInterval(explorationInterval);
}

// Level Visualization Logic
let levelStats = null;

function calculateLevelStats(frames) {
    if (!frames || frames.length === 0) return null;

    const counts = {};
    let maxLevel = 0;
    let maxCount = 0;

    frames.forEach(frame => {
        const level = frame.level !== undefined ? frame.level : 0;
        counts[level] = (counts[level] || 0) + 1;
        if (level > maxLevel) maxLevel = level;
        if (counts[level] > maxCount) maxCount = counts[level];
    });

    return { counts, maxLevel, maxCount };
}

function renderHistogram(stats) {
    const container = document.getElementById('level-histogram');
    container.innerHTML = '';
    
    if (!stats) return;

    for (let i = 0; i <= stats.maxLevel; i++) {
        const count = stats.counts[i] || 0;
        const heightPercentage = (count / stats.maxCount) * 100;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.id = `bar-level-${i}`;
        bar.style.height = `${Math.max(heightPercentage, 5)}%`; // Min height for visibility
        bar.title = `Level ${i}: ${count} nodes`;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        if (i % 5 === 0 || i === stats.maxLevel) { // Show label every 5 levels to avoid clutter
             label.textContent = i;
        }
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        container.appendChild(barContainer);
    }
}

function updateHistogramHighlight(currentLevel) {
    // Remove active class from all
    const allBars = document.querySelectorAll('.bar');
    allBars.forEach(b => b.classList.remove('active'));
    
    // Add to current
    if (currentLevel !== undefined && currentLevel !== null) {
        const activeBar = document.getElementById(`bar-level-${currentLevel}`);
        if (activeBar) {
            activeBar.classList.add('active');
            // Removed auto-scroll to prevent page jump
        }
        
        // Update summary text
        const summary = document.getElementById('level-summary');
        if (levelStats) {
            summary.textContent = `Max Depth: ${levelStats.maxLevel} | Current Level: ${currentLevel} (Nodes: ${levelStats.counts[currentLevel] || 0})`;
        }
    }
}

async function solvePuzzle() {
    solveBtn.disabled = true;
    replayBtn.disabled = true;
    statusDiv.textContent = 'Solving...';

    try {
        const algorithm = algorithmSelect.value;
        
        // Usamos ruta relativa, asumiendo que el frontend es servido por el mismo backend (Flask)
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
            throw new Error('Failed to find solution');
        }

        const result = await response.json();
        lastSolutionPath = result.path;
        lastExplorationHistory = result.execution_frames;
        
        // Sprint 3: Calculate and Render Level Stats
        levelStats = calculateLevelStats(lastExplorationHistory);
        renderHistogram(levelStats);

        // Sprint 5: Build and Initialize Tree
        treeData = buildTreeData(lastExplorationHistory);
        initializeTree(treeData);
        
        // Update stats
        statsContainer.classList.remove('hidden');
        statNodes.textContent = result.nodes_explored;
        statTime.textContent = result.time_taken.toFixed(4) + 's';
        statPath.textContent = lastSolutionPath ? lastSolutionPath.length - 1 : 'N/A';

        if (lastSolutionPath) {
            statusDiv.textContent = `Solution found!`;
        } else {
            statusDiv.textContent = `⚠️ Limit Reached! BFS explored ${result.nodes_explored} nodes without finding solution.`;
        }
        
        startAnimations();

    } catch (error) {
        statusDiv.textContent = 'Error: ' + error.message;
        solveBtn.disabled = false;
    }
}

function startAnimations() {
    // Clear existing
    if (solutionInterval) clearInterval(solutionInterval);
    if (explorationInterval) clearTimeout(explorationInterval);
    
    solveBtn.disabled = true;
    replayBtn.disabled = true;
    explorationPaused = false;
    explorationCurrentFrame = 0;
    updatePlayPauseButton();

    // Enable speed controls
    pauseBtn.disabled = false;
    skipBtn.disabled = false;
    speedSelect.disabled = false;

    // Animate Exploration (Right Board)
    if (lastExplorationHistory && lastExplorationHistory.length > 0) {
        const explorationHeader = document.querySelector('#grid-exploration').previousElementSibling;
        const originalText = explorationHeader.textContent.split(' (')[0];
        
        gridExploration.style.border = '3px solid #3b82f6';
        
        // Reset histogram highlight
        updateHistogramHighlight(null);
        
        function loop() {
            if (explorationCurrentFrame >= lastExplorationHistory.length) {
                // Animation Complete
                if (lastSolutionPath) {
                    highlightSolutionPath(lastSolutionPath);
                }
                
                explorationHeader.textContent = `${originalText} (Total: ${lastExplorationHistory.length})`;
                gridExploration.style.border = '';
                gridExploration.style.opacity = '1';
                pauseBtn.disabled = true;
                skipBtn.disabled = true;
                speedSelect.disabled = true;
                return;
            }

            if (!explorationPaused) {
                let currentState;
                let currentFrame = null;
                let previousState = null;
                
                const historyItem = lastExplorationHistory[explorationCurrentFrame];
                
                if (historyItem.node && Array.isArray(historyItem.node)) {
                    currentState = historyItem.node;
                    currentFrame = historyItem;
                    if (explorationCurrentFrame > 0) {
                        const prevItem = lastExplorationHistory[explorationCurrentFrame - 1];
                        previousState = prevItem.node || prevItem;
                    }
                } else {
                    currentState = historyItem;
                    if (explorationCurrentFrame > 0) {
                        previousState = lastExplorationHistory[explorationCurrentFrame - 1];
                    }
                }

                let movedTile = null;
                if (previousState) {
                    const zeroIndexPrev = previousState.indexOf(0);
                    const tileAtZeroNow = currentState[zeroIndexPrev];
                    if (tileAtZeroNow !== 0) movedTile = tileAtZeroNow;
                }

                renderGrid(currentState, 'grid-exploration', movedTile);
                updateNodeDetails(currentFrame);
                
                // Sprint 3: Update Histogram Highlight
                if (currentFrame && currentFrame.level !== undefined) {
                    updateHistogramHighlight(currentFrame.level);
                }

                // Sprint 4: Render Queue
                if (currentFrame && currentFrame.queue_snapshot) {
                    renderQueue(currentFrame.queue_snapshot);
                }

                // Sprint 5: Update Tree
                updateTree(currentFrame);
                
                explorationHeader.textContent = `🔍 Exploring (${explorationCurrentFrame + 1}/${lastExplorationHistory.length})`;
                explorationCurrentFrame++;
            }
            
            explorationInterval = setTimeout(loop, explorationSpeed);
        }
        
        loop();
    }
    
    // Animate Solution (Left Board)
    if (lastSolutionPath && lastSolutionPath.length > 0) {
        let i = 0;
        solutionInterval = setInterval(() => {
            if (i >= lastSolutionPath.length) {
                clearInterval(solutionInterval);
                statusDiv.textContent = 'Animation Complete!';
                solveBtn.disabled = false;
                replayBtn.disabled = false;
                return;
            }
            
            renderGrid(lastSolutionPath[i].state, 'grid');
            i++;
        }, 500); // Fixed speed for solution playback
    }
}

function renderMiniGrid(state) {
    const container = document.createElement('div');
    container.className = 'mini-grid';
    
    state.forEach(tile => {
        const div = document.createElement('div');
        div.className = tile === 0 ? 'mini-tile empty' : 'mini-tile';
        container.appendChild(div);
    });
    
    return container;
}

function renderQueue(snapshot) {
    const nextUpContainer = document.getElementById('queue-next-up');
    const restContainer = document.getElementById('queue-grid');
    
    if (!nextUpContainer || !restContainer) return;
    
    nextUpContainer.innerHTML = '';
    restContainer.innerHTML = '';
    
    if (!snapshot) return;
    
    // Next Up - Vista detallada con mini-grids
    if (snapshot.next_up && Array.isArray(snapshot.next_up)) {
        snapshot.next_up.forEach(item => {
            const miniGrid = renderMiniGrid(item.state);
            
            // Agregar color por nivel al borde del mini-grid
            const level = item.level || 0;
            miniGrid.classList.add(`level-${Math.min(level, 10)}`);
            
            // Información más clara
            const info = document.createElement('div');
            info.className = 'queue-info';
            if (item.f_score !== undefined) {
                info.textContent = `F:${item.f_score} (Nivel ${level})`;
            } else {
                info.textContent = `Nivel: ${level}`;
            }
            
            const wrapper = document.createElement('div');
            wrapper.className = 'queue-next-item';
            wrapper.appendChild(miniGrid);
            wrapper.appendChild(info);
            nextUpContainer.appendChild(wrapper);
        });
    }
    
    // Rest
    if (snapshot.rest && Array.isArray(snapshot.rest)) {
        snapshot.rest.forEach(item => {
            const div = document.createElement('div');
            div.className = 'queue-item';
            
            // Color coding
            if (item.f_score !== undefined) {
                // A*
                if (item.f_score < 10) div.classList.add('cost-low');
                else if (item.f_score < 20) div.classList.add('cost-med');
                else div.classList.add('cost-high');
                
                div.title = `F: ${item.f_score} (G: ${item.g_score} + H: ${item.h_score})`;
            } else {
                // BFS
                const level = item.level || 0;
                div.classList.add(`level-${Math.min(level, 10)}`); 
                div.title = `Level: ${level}`;
            }
            
            // Click event to show node details
            div.addEventListener('click', () => {
                showNodeState({
                    state: item.state,
                    level: item.level !== undefined ? item.level : (item.g_score || '?'),
                    step: 'En cola',
                    name: 'Pendiente'
                });
            });
            
            restContainer.appendChild(div);
        });
    }
}

// Sprint 5: Dynamic Search Tree Visualization
let treeData = null;
let treeLayout = null;
let rootNode = null;
let svg = null;
let g = null;
let zoom = null;

function buildTreeData(frames) {
    if (!frames || frames.length === 0) return null;

    // Map to store nodes by state string for quick parent lookup
    const nodeMap = new Map();
    const rootState = frames[0].node.toString();
    
    // Initialize root
    const root = {
        name: "Start",
        state: frames[0].node,
        children: [],
        level: 0,
        step: 1,
        id: rootState
    };
    nodeMap.set(rootState, root);

    // Build hierarchy
    frames.forEach(frame => {
        if (frame.step === 1) return; // Skip root, already added

        const stateStr = frame.node.toString();
        const parentStr = frame.parent ? frame.parent.toString() : null;

        if (parentStr && nodeMap.has(parentStr)) {
            const parentNode = nodeMap.get(parentStr);
            const newNode = {
                name: frame.action,
                state: frame.node,
                children: [],
                level: frame.level,
                step: frame.step,
                id: stateStr.replace(/,/g, '_'), // Sanitize ID
                parent: parentNode
            };
            parentNode.children.push(newNode);
            nodeMap.set(stateStr, newNode);
        }
    });

    // Sanitize root ID too
    root.id = rootState.replace(/,/g, '_');

    return root;
}

function initializeTree(data) {
    const container = document.getElementById('tree-container');
    container.innerHTML = ''; // Clear previous

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg = d3.select('#tree-container').append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom)
        .append('g');
        
    g = svg.append('g');

    if (!data) return;

    // Tree Layout
    // Reducimos el ancho entre nodos para que sea más compacto horizontalmente
    treeLayout = d3.tree().nodeSize([25, 50]); 
    rootNode = d3.hierarchy(data);
    treeLayout(rootNode);

    // Center the tree initially (Smart Fit)
    // Calculate bounds of the tree
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rootNode.each(d => {
        if (d.x < minX) minX = d.x;
        if (d.x > maxX) maxX = d.x;
        if (d.y < minY) minY = d.y;
        if (d.y > maxY) maxY = d.y;
    });

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;
    
    // Add some padding
    const padding = 40;
    const scaleX = (width - padding * 2) / treeWidth;
    const scaleY = (height - padding * 2) / treeHeight;
    
    // Intentamos ajustar a la pantalla, pero con un límite mínimo de legibilidad
    let initialScale = Math.min(scaleX, scaleY, 1);
    
    // Si el árbol es demasiado ancho, priorizamos la legibilidad sobre ver todo el árbol
    // 0.6 es un buen compromiso: se ve bastante estructura pero los nodos son legibles
    const MIN_READABLE_SCALE = 0.6;
    
    if (initialScale < MIN_READABLE_SCALE) {
        initialScale = MIN_READABLE_SCALE;
        // Si tuvimos que hacer zoom in por legibilidad, centramos el nodo raíz arriba al centro
        // en lugar de centrar todo el árbol (que podría dejar la raíz fuera de vista)
        const initialX = width / 2;
        const initialY = padding;
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(initialScale);
        svg.call(zoom.transform, initialTransform);
    } else {
        // Si cabe bien en la pantalla, centramos todo el árbol
        const initialX = (width - treeWidth * initialScale) / 2 - minX * initialScale;
        const initialY = padding;
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(initialScale);
        svg.call(zoom.transform, initialTransform);
    }

    // Render Links (Hidden initially)
    g.selectAll('.link')
        .data(rootNode.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('id', d => `link-${d.target.data.id}`)
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
        .style('opacity', 0);

    // Render Nodes (Hidden initially)
    const nodes = g.selectAll('.node')
        .data(rootNode.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('id', d => `node-${d.data.id}`)
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('opacity', 0); 

    nodes.append('circle')
        .attr('r', 4);
        
    // Agregar nivel como texto dentro del nodo
    nodes.append('text')
        .attr('dy', '.31em')
        .style('text-anchor', 'middle')
        .text(d => d.data.level !== undefined ? d.data.level : '')
        .style('opacity', 0)
        .style('font-size', '8px')
        .style('font-weight', 'bold')
        .style('fill', '#1e293b');
    
    // Agregar event listener para click
    nodes.on('click', function(event, d) {
        showNodeState(d.data);
    });
}

// Función para mostrar el estado de un nodo en el modal
function showNodeState(nodeData) {
    const modal = document.getElementById('node-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');
    const modalInfo = document.getElementById('modal-info');
    
    if (!modal || !nodeData.state) return;
    
    // Actualizar título
    modalTitle.textContent = `Nodo - Nivel ${nodeData.level}`;
    
    // Renderizar el estado del tablero
    modalGrid.innerHTML = '';
    nodeData.state.forEach(tile => {
        const div = document.createElement('div');
        div.className = tile === 0 ? 'tile empty' : 'tile';
        div.textContent = tile === 0 ? '' : tile;
        modalGrid.appendChild(div);
    });
    
    // Información adicional
    modalInfo.innerHTML = `
        <div class="info-row">
            <span>Paso:</span>
            <span>${nodeData.step}</span>
        </div>
        <div class="info-row">
            <span>Nivel/Profundidad:</span>
            <span>${nodeData.level}</span>
        </div>
        <div class="info-row">
            <span>Acción:</span>
            <span>${nodeData.name || 'Inicio'}</span>
        </div>
    `;
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

function updateTree(currentFrame) {
    if (!currentFrame || !g) return;

    const stateStr = currentFrame.node.toString();
    const safeId = stateStr.replace(/,/g, '_');
    
    // Reveal current node
    const node = g.select(`#node-${safeId}`);
    node.style('opacity', 1)
        .classed('visited', true);
    
    // Revelar texto del nivel también
    node.select('text')
        .style('opacity', 1);
        
    // Reveal link to parent
    if (currentFrame.parent) {
        // Link ID is based on target (current node)
        g.select(`#link-${safeId}`)
            .style('opacity', 0.6);
    }
    
    // Highlight Active
    g.selectAll('.node.active').classed('active', false);
    node.classed('active', true);
}

function highlightSolutionPath(path) {
    if (!path || !g) return;
    
    path.forEach((step, index) => {
        const stateStr = step.state.toString();
        const safeId = stateStr.replace(/,/g, '_');
        
        // Highlight Node
        g.select(`#node-${safeId}`)
            .classed('solution', true)
            .style('opacity', 1)
            .raise();
            
        // Highlight Link (except for root)
        if (index > 0) {
            g.select(`#link-${safeId}`)
                .classed('solution', true)
                .style('opacity', 1);
        }
    });
}

// Event Listeners
shuffleBtn.addEventListener('click', shuffle);
solveBtn.addEventListener('click', solvePuzzle);
replayBtn.addEventListener('click', startAnimations);

pauseBtn.addEventListener('click', () => {
    explorationPaused = !explorationPaused;
    updatePlayPauseButton();
});

skipBtn.addEventListener('click', () => {
    // Skip to end
    explorationCurrentFrame = lastExplorationHistory.length;
    // The loop will catch this on next tick and finish
});

speedSelect.addEventListener('change', (e) => {
    explorationSpeed = parseInt(e.target.value);
});

function updatePlayPauseButton() {
    pauseBtn.textContent = explorationPaused ? '▶' : '⏸';
}

// Initial shuffle on load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing...");
    shuffle();
});

// Event listeners para el modal
const modal = document.getElementById('node-modal');
const modalClose = document.querySelector('.modal-close');

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

// Event listeners para controles del Ã¡rbol
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const resetZoomBtn = document.getElementById('reset-zoom-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const treeSection = document.querySelector('.tree-section');

if (zoomInBtn && zoom) {
    zoomInBtn.addEventListener('click', () => {
        const container = document.getElementById('tree-container');
        const svgElement = d3.select(container).select('svg');
        svgElement.transition().call(zoom.scaleBy, 1.3);
    });
}

if (zoomOutBtn && zoom) {
    zoomOutBtn.addEventListener('click', () => {
        const container = document.getElementById('tree-container');
        const svgElement = d3.select(container).select('svg');
        svgElement.transition().call(zoom.scaleBy, 0.7);
    });
}

if (resetZoomBtn && zoom) {
    resetZoomBtn.addEventListener('click', () => {
        const container = document.getElementById('tree-container');
        const svgElement = d3.select(container).select('svg');
        svgElement.transition().call(zoom.transform, d3.zoomIdentity);
    });
}

if (fullscreenBtn && treeSection) {
    fullscreenBtn.addEventListener('click', () => {
        treeSection.classList.toggle('fullscreen');
        fullscreenBtn.textContent = treeSection.classList.contains('fullscreen') ? '⛶ Salir' : '⛶';
        
        // Redimensionar el SVG existente para no perder el estado
        setTimeout(() => {
            const container = document.getElementById('tree-container');
            const svgElement = d3.select(container).select('svg');
            
            if (!svgElement.empty()) {
                const width = container.clientWidth;
                const height = container.clientHeight;
                svgElement.attr('width', width).attr('height', height);
                // No reinicializamos el árbol para mantener los nodos visitados/coloreados
            } else if (treeData) {
                // Solo si no existe (caso raro), inicializar
                initializeTree(treeData);
            }
        }, 100);
    });
}


