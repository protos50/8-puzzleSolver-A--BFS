// Rendering functions for grids and UI elements

function renderGrid(state, elementId, highlightTile = null, highlightClass = 'moving') {
    const grid = document.getElementById(elementId);
    
    // Remove any existing arrows
    const existingArrow = grid.querySelector('.movement-arrow');
    if (existingArrow) existingArrow.remove();
    
    grid.innerHTML = '';
    state.forEach((tile, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = tile === 0 ? 'tile empty' : 'tile';
        tileDiv.textContent = tile === 0 ? '' : tile;
        
        if (tile === highlightTile && tile !== 0) {
            tileDiv.classList.add(highlightClass);
        }
        
        grid.appendChild(tileDiv);
    });
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
    
    const fScore = document.getElementById('detail-f-score');
    const gScore = document.getElementById('detail-g-score');
    const hScore = document.getElementById('detail-h-score');
    const astarItems = document.querySelectorAll('.astar-only');
    
    if (frame.f_score !== undefined) {
        astarItems.forEach(item => item.classList.remove('hidden'));
        if (fScore) fScore.textContent = frame.f_score;
        if (gScore) gScore.textContent = frame.g_score;
        if (hScore) hScore.textContent = frame.h_score;
    } else {
        astarItems.forEach(item => item.classList.add('hidden'));
    }
}

function showNodeState(nodeData) {
    const modal = document.getElementById('node-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');
    const modalInfo = document.getElementById('modal-info');
    
    if (!modal || !nodeData.state) return;
    
    modalTitle.textContent = `Node - Level ${nodeData.level}`;
    
    modalGrid.innerHTML = '';
    nodeData.state.forEach(tile => {
        const div = document.createElement('div');
        div.className = tile === 0 ? 'tile empty' : 'tile';
        div.textContent = tile === 0 ? '' : tile;
        modalGrid.appendChild(div);
    });
    
    modalInfo.innerHTML = `
        <div class="info-row">
            <span>Step:</span>
            <span>${nodeData.step}</span>
        </div>
        <div class="info-row">
            <span>Level/Depth:</span>
            <span>${nodeData.level}</span>
        </div>
        <div class="info-row">
            <span>Action:</span>
            <span>${nodeData.name || 'Start'}</span>
        </div>
    `;
    
    modal.classList.remove('hidden');
}
