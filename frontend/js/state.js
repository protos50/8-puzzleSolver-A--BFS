// State management for the 8-Puzzle application
let currentState = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 represents empty tile
let lastSolutionPath = null;
let lastExplorationHistory = null;
let solutionInterval = null;
let explorationInterval = null;
let explorationPaused = false;
let explorationCurrentFrame = 0;
let explorationSpeed = 200; // ms per frame
let levelStats = null;
let treeData = null;
let treeLayout = null;
let rootNode = null;
let svg = null;
let g = null;
let zoom = null;
