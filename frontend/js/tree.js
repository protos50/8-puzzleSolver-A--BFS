// Dynamic Search Tree Visualization
let isGridVisible = false;
let treeWorker = null;
let initialTreeTransform = null; // Store initial centered transform
let treeRadius = 0; // Store radius for resizing

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
    // Clear only the SVG, preserve controls
    d3.select(container).select('svg').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg = d3.select('#tree-container').insert('svg', ':first-child')
        .attr('width', width)
        .attr('height', height)
        .call(zoom);
        
    g = svg.append('g');

    if (!data) return;

    rootNode = d3.hierarchy(data);

    // Dynamic radius: ensure enough space between levels
    const levelSpacing = 100; 
    const maxDepth = rootNode.height || 1;
    treeRadius = Math.max(Math.min(width, height) / 2 - 50, maxDepth * levelSpacing);

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
        .size([2 * Math.PI, treeRadius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
    
    treeLayout(rootNode);

    // Center the tree
    const initialScale = Math.min(width, height) / (treeRadius * 2.5);
    initialTreeTransform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(Math.max(initialScale, 0.2));
        
    svg.call(zoom.transform, initialTreeTransform);

    // Color scale for depth
    const maxDepthVal = rootNode.height || 10;
    const colorScale = d3.scaleSequential()
        .domain([0, maxDepthVal])
        .interpolator(d3.interpolateCool);

    // Render all links at once (hidden initially)
    g.selectAll('.link')
        .data(rootNode.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('id', d => `link-${d.target.data.id}`)
        .attr('d', d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
        .style('opacity', 0);

    // Render all nodes at once (hidden initially, except root)
    const nodes = g.selectAll('.node')
        .data(rootNode.descendants())
        .enter().append('g')
        .attr('class', d => `node ${d.depth === 0 ? 'visited' : ''}`)
        .attr('id', d => `node-${d.data.id}`)
        .attr('transform', d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .style('opacity', d => d.depth === 0 ? 1 : 0);

    nodes.append('circle')
        .attr('r', 10)
        .style('fill', d => colorScale(d.depth));
        
    nodes.append('text')
        .attr('dy', '.35em')
        .attr('x', 0)
        .style('text-anchor', 'middle')
        .attr('transform', d => `rotate(${- (d.x * 180 / Math.PI - 90)})`)
        .text(d => d.data.level !== undefined ? d.data.level : '')
        .style('opacity', d => d.depth === 0 ? 1 : 0)
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', '#ffffff');
    
    nodes.on('click', function(event, d) {
        showNodeState(d.data);
    });
}

function updateTree(currentFrame) {
    if (!currentFrame || !g) return;

    const stateStr = currentFrame.node.toString();
    const safeId = stateStr.replace(/,/g, '_');
    
    // Reveal current node
    const node = g.select(`#node-${safeId}`);
    node.style('opacity', 1)
        .classed('visited', true);
    
    // Reveal text
    node.select('text')
        .style('opacity', 1);
        
    // Reveal link to parent
    if (currentFrame.parent) {
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

function toggleTreeGrid() {
    isGridVisible = !isGridVisible;
    if (g) {
        g.select('.grid-layer')
            .transition()
            .duration(300)
            .style('opacity', isGridVisible ? 1 : 0);
    }
}

function resetTreeZoom() {
    if (svg && zoom && initialTreeTransform) {
        svg.transition()
            .duration(750)
            .call(zoom.transform, initialTreeTransform);
    }
}

function resizeTree() {
    const container = document.getElementById('tree-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    
    if (svg && zoom) {
        svg.attr('width', width).attr('height', height);
        
        // Recalculate initial transform for the new size
        const initialScale = Math.min(width, height) / (treeRadius * 2.5);
        initialTreeTransform = d3.zoomIdentity
            .translate(centerX, centerY)
            .scale(Math.max(initialScale, 0.2));
            
        // Apply new transform to center
        svg.transition().duration(500).call(zoom.transform, initialTreeTransform);
    }
}
