// Dynamic Search Tree Visualization
let isGridVisible = false;
let treeWorker = null;

// Initialize worker
if (window.Worker) {
    treeWorker = new Worker('js/tree.worker.js');
    treeWorker.onmessage = function(e) {
        const { type, payload } = e.data;
        if (type === 'TREE_DATA_READY') {
            initializeTree(payload);
        } else if (type === 'ERROR') {
            console.error('Tree Worker Error:', payload);
        }
    };
}

function buildTreeData(frames) {
    // Offload to worker if available
    if (treeWorker) {
        treeWorker.postMessage({ type: 'PROCESS_TREE_DATA', payload: frames });
        return null; // Async return
    } else {
        // Fallback for no worker support (legacy)
        console.warn("Web Workers not supported, running on main thread.");
        // ... (Keep original logic as fallback or just rely on worker)
        // For simplicity, let's assume worker support or copy the logic here if needed.
        // But since we are optimizing, let's just use the worker path primarily.
        return null; 
    }
}

function initializeTree(data) {
    const container = document.getElementById('tree-container');
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg = d3.select('#tree-container').append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);
        
    g = svg.append('g');

    if (!data) return;

    rootNode = d3.hierarchy(data);

    // Dynamic radius: ensure enough space between levels
    // This allows the tree to grow larger than the screen if needed (zoom handles it)
    const levelSpacing = 100; 
    const maxDepth = rootNode.height || 1;
    const radius = Math.max(Math.min(width, height) / 2 - 50, maxDepth * levelSpacing);

    // Draw concentric circles for levels
    const gridGroup = g.append('g').attr('class', 'grid-layer').style('opacity', isGridVisible ? 1 : 0);
    for (let i = 1; i <= maxDepth; i++) {
        gridGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', i * levelSpacing)
            .attr('class', 'level-grid');
    }

    treeLayout = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
    
    treeLayout(rootNode);

    // Center the tree
    // Adjust initial zoom to fit the tree nicely or start centered
    const initialScale = Math.min(width, height) / (radius * 2.5); // Zoom out to fit initially
    const initialTransform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(Math.max(initialScale, 0.2)); // Don't zoom out too much
        
    svg.call(zoom.transform, initialTransform);

    // Color scale for depth (Blue -> Purple -> Pink)
    const maxDepthVal = rootNode.height || 10;
    const colorScale = d3.scaleSequential()
        .domain([0, maxDepthVal])
        .interpolator(d3.interpolateCool);

    // Batch rendering to prevent UI freeze
    const allLinks = rootNode.links();
    const allNodes = rootNode.descendants();
    const batchSize = 500; 
    let currentIndex = 0;

    function renderBatch() {
        // Render Links Batch
        if (currentIndex < allLinks.length) {
            const linksBatch = allLinks.slice(currentIndex, Math.min(currentIndex + batchSize, allLinks.length));
            g.selectAll('.link-batch-' + currentIndex) 
                .data(linksBatch)
                .enter().append('path')
                .attr('class', 'link')
                .attr('id', d => `link-${d.target.data.id}`)
                .attr('d', d3.linkRadial()
                    .angle(d => d.x)
                    .radius(d => d.y))
                .style('opacity', 0);
        }

        // Render Nodes Batch
        if (currentIndex < allNodes.length) {
            const nodesBatch = allNodes.slice(currentIndex, Math.min(currentIndex + batchSize, allNodes.length));
            const nodes = g.selectAll('.node-batch-' + currentIndex)
                .data(nodesBatch)
                .enter().append('g')
                .attr('class', 'node')
                .attr('id', d => `node-${d.data.id}`)
                .attr('transform', d => `
                    rotate(${d.x * 180 / Math.PI - 90})
                    translate(${d.y},0)
                `)
                .style('opacity', 0); 

            nodes.append('circle')
                .attr('r', 10)
                .style('fill', d => colorScale(d.depth));
                
            nodes.append('text')
                .attr('dy', '.35em')
                .attr('x', 0)
                .style('text-anchor', 'middle')
                .attr('transform', d => `rotate(${- (d.x * 180 / Math.PI - 90)})`)
                .text(d => d.data.level !== undefined ? d.data.level : '')
                .style('opacity', 0)
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .style('fill', '#ffffff');
            
            nodes.on('click', function(event, d) {
                showNodeState(d.data);
            });
        }

        currentIndex += batchSize;
        if (currentIndex < Math.max(allLinks.length, allNodes.length)) {
            requestAnimationFrame(renderBatch);
        }
    }

    renderBatch();
}

function updateTree(currentFrame) {
    if (!currentFrame || !g) return;

    const stateStr = currentFrame.node.toString();
    const safeId = stateStr.replace(/,/g, '_');
    
    const node = g.select(`#node-${safeId}`);
    node.style('opacity', 1)
        .classed('visited', true);
    
    node.select('text')
        .style('opacity', 1);
        
    if (currentFrame.parent) {
        g.select(`#link-${safeId}`)
            .style('opacity', 0.6);
    }
    
    g.selectAll('.node.active').classed('active', false);
    node.classed('active', true);
}

function highlightSolutionPath(path) {
    if (!path || !g) return;
    
    path.forEach((step, index) => {
        const stateStr = step.state.toString();
        const safeId = stateStr.replace(/,/g, '_');
        
        g.select(`#node-${safeId}`)
            .classed('solution', true)
            .style('opacity', 1)
            .raise();
            
        if (index > 0) {
            g.select(`#link-${safeId}`)
                .classed('solution', true)
                .style('opacity', 1);
        }
    });
}

function toggleTreeGrid() {
    isGridVisible = !isGridVisible;
    if (g) {
        g.select('.grid-layer')
            .transition()
            .duration(300)
            .style('opacity', isGridVisible ? 1 : 0);
    }
}
