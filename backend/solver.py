import heapq
from collections import deque
import time

class Node:
    def __init__(self, state, parent=None, action=None, g=0, h=0):
        self.state = state
        self.parent = parent
        self.action = action
        self.g = g  # Cost from start
        self.h = h  # Heuristic cost to goal
        self.f = g + h  # Total cost

    def __lt__(self, other):
        return self.f < other.f

    def __eq__(self, other):
        return self.state == other.state

    def __hash__(self):
        return hash(self.state)

def get_manhattan_distance(state):
    distance = 0
    for i, tile in enumerate(state):
        if tile == 0: continue
        # Target position for tile (1 at index 0, 2 at index 1, ..., 8 at index 7)
        target_idx = tile - 1
        current_row, current_col = divmod(i, 3)
        target_row, target_col = divmod(target_idx, 3)
        distance += abs(current_row - target_row) + abs(current_col - target_col)
    return distance

def get_neighbors(node):
    neighbors = []
    state = list(node.state)
    zero_idx = state.index(0)
    row, col = divmod(zero_idx, 3)

    moves = {
        'UP': (-1, 0),
        'DOWN': (1, 0),
        'LEFT': (0, -1),
        'RIGHT': (0, 1)
    }

    for action, (dr, dc) in moves.items():
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_idx = new_row * 3 + new_col
            new_state = list(state)
            new_state[zero_idx], new_state[new_idx] = new_state[new_idx], new_state[zero_idx]
            neighbors.append((tuple(new_state), action))
    
    return neighbors

def reconstruct_path(node):
    path = []
    while node:
        path.append({
            'state': node.state,
            'action': node.action
        })
        node = node.parent
    return path[::-1]

def solve_astar(start_state):
    start_node = Node(tuple(start_state), g=0, h=get_manhattan_distance(start_state))
    frontier = []
    heapq.heappush(frontier, start_node)
    explored = set()
    nodes_explored = 0
    start_time = time.time()
    explored_history = []

    while frontier:
        current_node = heapq.heappop(frontier)
        nodes_explored += 1
        
        if len(explored_history) < 2000:  # Increased for better visualization
            explored_history.append(list(current_node.state))

        if current_node.state == (1, 2, 3, 4, 5, 6, 7, 8, 0):
            return {
                'path': reconstruct_path(current_node),
                'nodes_explored': nodes_explored,
                'time_taken': time.time() - start_time,
                'explored_history': explored_history
            }

        explored.add(current_node.state)

        for neighbor_state, action in get_neighbors(current_node):
            if neighbor_state in explored:
                continue
            
            g_cost = current_node.g + 1
            h_cost = get_manhattan_distance(neighbor_state)
            neighbor_node = Node(neighbor_state, current_node, action, g_cost, h_cost)
import heapq
from collections import deque
import time

class Node:
    def __init__(self, state, parent=None, action=None, g=0, h=0):
        self.state = state
        self.parent = parent
        self.action = action
        self.g = g  # Cost from start
        self.h = h  # Heuristic cost to goal
        self.f = g + h  # Total cost

    def __lt__(self, other):
        return self.f < other.f

    def __eq__(self, other):
        return self.state == other.state

    def __hash__(self):
        return hash(self.state)

def get_manhattan_distance(state):
    distance = 0
    for i, tile in enumerate(state):
        if tile == 0: continue
        # Target position for tile (1 at index 0, 2 at index 1, ..., 8 at index 7)
        target_idx = tile - 1
        current_row, current_col = divmod(i, 3)
        target_row, target_col = divmod(target_idx, 3)
        distance += abs(current_row - target_row) + abs(current_col - target_col)
    return distance

def get_neighbors(node):
    neighbors = []
    state = list(node.state)
    zero_idx = state.index(0)
    row, col = divmod(zero_idx, 3)

    moves = {
        'UP': (-1, 0),
        'DOWN': (1, 0),
        'LEFT': (0, -1),
        'RIGHT': (0, 1)
    }

    for action, (dr, dc) in moves.items():
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_idx = new_row * 3 + new_col
            new_state = list(state)
            new_state[zero_idx], new_state[new_idx] = new_state[new_idx], new_state[zero_idx]
            neighbors.append((tuple(new_state), action))
    
    return neighbors

def reconstruct_path(node):
    path = []
    while node:
        path.append({
            'state': node.state,
            'action': node.action
        })
        node = node.parent
    return path[::-1]

def get_queue_snapshot(queue, is_priority=False):
    """Helper to create a lightweight snapshot of the queue for visualization."""
    snapshot = {
        'next_up': [],
        'rest': []
    }
    
    # Limit for 'rest' to avoid huge payloads
    # If we have many frames, we must be very conservative to avoid 500MB+ payloads
    rest_limit = 20 
    next_up_limit = 5
    
    if is_priority:
        # For priority queue (A*), queue is a list of (f, count, node)
        # We can't easily slice a heap to get sorted order without popping, 
        # but for visualization, the top N items in the list are roughly the "next" ones 
        # (specifically, index 0 is min, others are partially ordered).
        # To be accurate for "Next Up", we should probably use nsmallest, but it might be slow.
        # Let's just take the first few elements of the list representation.
        
        # Next Up (Detailed)
        raw_next = queue[:next_up_limit]
        for item in raw_next:
             snapshot['next_up'].append({
                'state': list(item[2].state),
                'f': item[0],
                'g': item[2].g,
                'h': item[2].h
            })
            
        # Rest (Just scores/levels for the grid)
        # We'll take a slice of the rest. Note: this isn't perfectly sorted order.
        raw_rest = queue[next_up_limit:next_up_limit+rest_limit]
        for item in raw_rest:
            snapshot['rest'].append({
                'state': list(item[2].state),
                'f_score': item[0],
                'g_score': item[2].g,
                'h_score': item[2].h
            })
            
    else:
        # For deque (BFS)
        import itertools
        
        # Next Up
        for node in itertools.islice(queue, 0, next_up_limit):
             snapshot['next_up'].append({
                'state': list(node.state),
                'level': len(reconstruct_path(node)) - 1
            })
            
        # Rest
        for node in itertools.islice(queue, next_up_limit, next_up_limit + rest_limit):
             snapshot['rest'].append({
                'state': list(node.state),
                'level': len(reconstruct_path(node)) - 1
             })

    return snapshot

def solve_astar(start_state):
    start_node = Node(tuple(start_state), g=0, h=get_manhattan_distance(start_state))
    
    frontier = []
    count = 0 # For tie-breaking in heapq
    heapq.heappush(frontier, (start_node.f, count, start_node)) # Use start_node.f directly
    
    explored = set()
    nodes_explored = 0
    start_time = time.time()
    
    execution_frames = []
    step_counter = 0

    while frontier:
        current_node = heapq.heappop(frontier)[2] # Get the Node object
        nodes_explored += 1
        step_counter += 1
        
        # Record Frame
        if len(execution_frames) < 20000:
            frame = {
                'step': step_counter,
                'node': list(current_node.state),
                'level': current_node.g,
                'f_score': current_node.f, # Use current_node.f directly
                'g_score': current_node.g,
                'h_score': current_node.h,
                'queue_snapshot': get_queue_snapshot(frontier, is_priority=True),
                'action': current_node.action,
                'parent': list(current_node.parent.state) if current_node.parent else None
            }
            execution_frames.append(frame)

        if current_node.state == (1, 2, 3, 4, 5, 6, 7, 8, 0):
            return {
                'path': reconstruct_path(current_node),
                'nodes_explored': nodes_explored,
                'time_taken': time.time() - start_time,
                'execution_frames': execution_frames
            }

        explored.add(current_node.state)

        for neighbor_state, action in get_neighbors(current_node):
            if neighbor_state in explored:
                continue
            
            g_cost = current_node.g + 1
            h_cost = get_manhattan_distance(neighbor_state)
            neighbor_node = Node(neighbor_state, current_node, action, g_cost, h_cost)
            
            # Check if in frontier with lower cost (simplified: just add, heap handles it)
            count += 1
            heapq.heappush(frontier, (neighbor_node.f, count, neighbor_node)) # Use neighbor_node.f directly

    return {
        'path': None,
        'nodes_explored': nodes_explored,
        'time_taken': time.time() - start_time,
        'execution_frames': execution_frames
    }

def solve_bfs(start_state, max_nodes=10000):
    start_node = Node(tuple(start_state))
    queue = deque([start_node])
    explored = set()
    explored.add(tuple(start_state))
    nodes_explored = 0
    start_time = time.time()
    
    # New: Execution Frames instead of simple history
    execution_frames = []
    
    step_counter = 0

    while queue:
        # Capture frame BEFORE popping (to see queue state)
        # Or AFTER popping (to see current node). Let's do AFTER popping to have a "current node".
        
        if nodes_explored >= max_nodes:
            print(f"BFS limit reached: {nodes_explored} nodes explored (limit: {max_nodes})")
            return {
                'path': None,
                'nodes_explored': nodes_explored,
                'time_taken': time.time() - start_time,
                'execution_frames': execution_frames
            }

        current_node = queue.popleft()
        nodes_explored += 1
        step_counter += 1
        
        # Record Frame
        if len(execution_frames) < 20000:
            frame = {
                'step': step_counter,
                'node': list(current_node.state),
                'level': len(reconstruct_path(current_node)) - 1,
                'queue_snapshot': get_queue_snapshot(queue, is_priority=False),
                'action': current_node.action,
                'parent': list(current_node.parent.state) if current_node.parent else None
            }
            execution_frames.append(frame)

        if current_node.state == (1, 2, 3, 4, 5, 6, 7, 8, 0):
            return {
                'path': reconstruct_path(current_node),
                'nodes_explored': nodes_explored,
                'time_taken': time.time() - start_time,
                'execution_frames': execution_frames
            }

        for neighbor_state, action in get_neighbors(current_node):
            if neighbor_state not in explored:
                explored.add(neighbor_state)
                neighbor_node = Node(neighbor_state, current_node, action)
                queue.append(neighbor_node)

    return {
        'path': None,
        'nodes_explored': nodes_explored,
        'time_taken': time.time() - start_time,
        'execution_frames': execution_frames
    }

def solve_puzzle(start_state, algorithm='astar', max_nodes=10000):
    if algorithm == 'bfs':
        return solve_bfs(start_state, max_nodes)
    else:
        return solve_astar(start_state)
