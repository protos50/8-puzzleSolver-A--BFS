from backend.solver import solve_puzzle

start_state = [1, 2, 3, 4, 5, 6, 7, 0, 8] # Simple state
result = solve_puzzle(start_state, 'astar')

print(f"Algorithm: A*")
print(f"Path found: {result['path'] is not None}")
print(f"Nodes explored: {result['nodes_explored']}")
print(f"History length: {len(result['explored_history'])}")
print(f"First history item: {result['explored_history'][0] if result['explored_history'] else 'None'}")

print("-" * 20)

result_bfs = solve_puzzle(start_state, 'bfs')
print(f"Algorithm: BFS")
print(f"Path found: {result_bfs['path'] is not None}")
print(f"Nodes explored: {result_bfs['nodes_explored']}")
print(f"History length: {len(result_bfs['explored_history'])}")
