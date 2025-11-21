// Dynamic Search Tree Visualization

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

    // Use radial tree layout for better space utilization
    const radius = Math.min(width, height) / 2 - 100;
    treeLayout = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);
    
    rootNode = d3.hierarchy(data);
    treeLayout(rootNode);

    // Center the tree
    const initialTransform = d3.zoomIdentity.translate(centerX, centerY);
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
        .attr('r', 5);
        
    // Text labels adjusted for radial layout
    nodes.append('text')
        .attr('dy', '.31em')
        .attr('x', d => d.x < Math.PI === !d.children ? 6 : -6)
        .style('text-anchor', d => d.x < Math.PI === !d.children ? 'start' : 'end')
        .attr('transform', d => d.x >= Math.PI ? 'rotate(180)' : null)
        .text(d => d.data.level !== undefined ? d.data.level : '')
        .style('opacity', 0)
        .style('font-size', '9px')
        .style('font-weight', 'bold')
        .style('fill', '#cbd5e1');
    
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
