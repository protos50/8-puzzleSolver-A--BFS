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

    // Use logarithmic scale for better visual distribution
    const logMax = Math.log10(stats.maxCount + 1);

    for (let i = 0; i <= stats.maxLevel; i++) {
        const count = stats.counts[i] || 0;
        
        let heightPercentage = 0;
        if (count > 0) {
            // Logarithmic scaling for better visual proportion
            const logValue = Math.log10(count + 1);
            // Scale to 85% max to leave room for labels
            heightPercentage = (logMax > 0) ? (logValue / logMax) * 85 : 85;
            // Ensure minimum visibility for non-zero counts
            heightPercentage = Math.max(heightPercentage, 5);
        }
        
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.id = `bar-level-${i}`;
        bar.style.height = `${heightPercentage}%`;
        bar.title = `Level ${i}: ${count} nodes`;
        
        // Add count label
        const countLabel = document.createElement('div');
        countLabel.className = 'bar-count';
        countLabel.textContent = count;
        bar.appendChild(countLabel);
        
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
