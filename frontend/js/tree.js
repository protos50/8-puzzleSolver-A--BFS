// Dynamic Search Tree Visualization
let isGridVisible = false;

function buildTreeData(frames) {
    if (!frames || frames.length === 0) return null;

    const nodeMap = new Map();
    const rootState = frames[0].node.toString();
    
    const root = {
        name: "Start",
        state: frames[0].node,
        children: [],
        level: 0,
        step: 1,
        id: rootState
    };
    nodeMap.set(rootState, root);

    frames.forEach(frame => {
        if (frame.step === 1) return;

        const stateStr = frame.node.toString();
        const parentStr = frame.parent ? frame.parent.toString() : null;

        if (parentStr && nodeMap.has(parentStr)) {
            const parent = nodeMap.get(parentStr);
            const safeId = stateStr.replace(/,/g, '_');
            
            const child = {
                name: frame.action || `Step ${frame.step}`,
                state: frame.node,
                children: [],
                level: frame.level !== undefined ? frame.level : parent.level + 1,
                step: frame.step,
                id: safeId
            };
            
            parent.children.push(child);
            nodeMap.set(stateStr, child);
        }
    });

    root.id = rootState.replace(/,/g, '_');

    return root;
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

    // Render links with radial projection
    g.selectAll('.link')
        .data(rootNode.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('id', d => `link-${d.target.data.id}`)
        .attr('d', d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
        .style('opacity', 0);

    // Color scale for depth (Blue -> Purple -> Pink)
    const maxDepthVal = rootNode.height || 10;
    const colorScale = d3.scaleSequential()
        .domain([0, maxDepthVal])
        .interpolator(d3.interpolateCool);

    // Render nodes with radial projection
    const nodes = g.selectAll('.node')
        .data(rootNode.descendants())
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
        
    // Text labels centered and upright
    nodes.append('text')
        .attr('dy', '.35em')
        .attr('x', 0)
        .style('text-anchor', 'middle')
        // Counter-rotate text to keep it horizontal/upright
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
