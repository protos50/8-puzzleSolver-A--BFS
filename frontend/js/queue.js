// Queue/Frontier visualization

function renderQueue(snapshot) {
    const nextUpContainer = document.getElementById('queue-next-up');
    const restContainer = document.getElementById('queue-grid');
    
    if (!nextUpContainer || !restContainer) return;
    
    nextUpContainer.innerHTML = '';
    restContainer.innerHTML = '';
    
    if (!snapshot) return;
    
    // Next Up - Detailed view with mini-grids
    if (snapshot.next_up && Array.isArray(snapshot.next_up)) {
        snapshot.next_up.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'queue-next-item';
            
            const miniGrid = renderMiniGrid(item.state);
            const level = item.level !== undefined ? item.level : 0;
            const levelClass = level > 10 ? 'level-high' : `level-${level}`;
            miniGrid.classList.add(levelClass);
            
            wrapper.appendChild(miniGrid);
            
            const info = document.createElement('div');
            info.className = 'queue-info';
            info.textContent = `L${level}`;
            if (item.f_score !== undefined) {
                info.textContent += ` | f=${item.f_score}`;
            }
            wrapper.appendChild(info);
            
            nextUpContainer.appendChild(wrapper);
        });
    }
    
    // Rest
    if (snapshot.rest && Array.isArray(snapshot.rest)) {
        snapshot.rest.forEach(item => {
            const level = item.level !== undefined ? item.level : 0;
            const levelClass = level > 10 ? 'level-high' : `level-${level}`;
            
            const square = document.createElement('div');
            square.className = `queue-item ${levelClass}`;
            square.title = `Level ${level}`;
            
            square.addEventListener('click', () => {
                if (item.state) {
                    showNodeState({
                        state: item.state,
                        level: level,
                        step: item.step || '?',
                        name: item.action || 'Unknown'
                    });
                }
            });
            
            restContainer.appendChild(square);
        });
    }
}
