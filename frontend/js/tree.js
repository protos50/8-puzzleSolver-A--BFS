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

    treeLayout = d3.tree().nodeSize([25, 50]); 
    rootNode = d3.hierarchy(data);
    treeLayout(rootNode);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rootNode.each(d => {
        if (d.x < minX) minX = d.x;
        if (d.x > maxX) maxX = d.x;
        if (d.y < minY) minY = d.y;
        if (d.y > maxY) maxY = d.y;
    });

    const treeWidth = maxX - minX;
    const treeHeight = maxY - minY;
    
    const padding = 40;
    const scaleX = (width - padding * 2) / treeWidth;
    const scaleY = (height - padding * 2) / treeHeight;
    
    let initialScale = Math.min(scaleX, scaleY, 1);
    const MIN_READABLE_SCALE = 0.6;
    
    if (initialScale < MIN_READABLE_SCALE) {
        initialScale = MIN_READABLE_SCALE;
        const initialX = width / 2;
        const initialY = padding;
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(initialScale);
        svg.call(zoom.transform, initialTransform);
    } else {
        const initialX = (width - treeWidth * initialScale) / 2 - minX * initialScale;
        const initialY = padding;
        const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(initialScale);
        svg.call(zoom.transform, initialTransform);
    }

    g.selectAll('.link')
        .data(rootNode.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('id', d => `link-${d.target.data.id}`)
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
        .style('opacity', 0);

    const nodes = g.selectAll('.node')
        .data(rootNode.descendants())
        .enter().append('g')
        .attr('class', 'node')
        .attr('id', d => `node-${d.data.id}`)
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('opacity', 0); 

    nodes.append('circle')
        .attr('r', 4);
        
    nodes.append('text')
        .attr('dy', '.31em')
        .style('text-anchor', 'middle')
        .text(d => d.data.level !== undefined ? d.data.level : '')
        .style('opacity', 0)
        .style('font-size', '8px')
        .style('font-weight', 'bold')
        .style('fill', '#1e293b');
    
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
