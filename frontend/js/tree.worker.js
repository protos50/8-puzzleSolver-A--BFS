// Web Worker for processing tree data
// This runs in a separate thread to avoid freezing the UI

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'PROCESS_TREE_DATA') {
        const frames = payload;
        
        try {
            const root = buildTreeData(frames);
            self.postMessage({ type: 'TREE_DATA_READY', payload: root });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    }
};

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

    // Process frames in chunks to avoid blocking the worker too long (though less critical here)
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (frame.step === 1) continue;

        const stateStr = frame.node.toString();
        const parentStr = frame.parent ? frame.parent.toString() : null;

        if (parentStr && nodeMap.has(parentStr)) {
            const parent = nodeMap.get(parentStr);
            // Simple ID generation
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
    }

    root.id = rootState.replace(/,/g, '_');
    return root;
}
