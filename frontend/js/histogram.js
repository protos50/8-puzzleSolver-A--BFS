// Level histogram visualization

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
        bar.style.height = `${Math.max(heightPercentage, 5)}%`;
        bar.title = `Level ${i}: ${count} nodes`;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        if (i % 5 === 0 || i === stats.maxLevel) {
             label.textContent = i;
        }
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        container.appendChild(barContainer);
    }
}

function updateHistogramHighlight(currentLevel) {
    const allBars = document.querySelectorAll('.bar');
    allBars.forEach(b => b.classList.remove('active'));
    
    if (currentLevel !== undefined && currentLevel !== null) {
        const activeBar = document.getElementById(`bar-level-${currentLevel}`);
        if (activeBar) {
            activeBar.classList.add('active');
        }
        
        const summary = document.getElementById('level-summary');
        if (levelStats) {
            summary.textContent = `Nivel actual: ${currentLevel} | Máximo: ${levelStats.maxLevel}`;
        }
    }
}
