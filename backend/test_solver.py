from solver import solve_puzzle

def test_solver():
    # Simple case: 1 move away
    # Goal: 1 2 3 4 5 6 7 8 0
    # Start: 1 2 3 4 5 6 7 0 8
    start_state = (1, 2, 3, 4, 5, 6, 7, 0, 8)
    
    print("Testing A*...")
    result_astar = solve_puzzle(start_state, algorithm='astar')
    assert result_astar is not None
    assert 'path' in result_astar
    assert 'nodes_explored' in result_astar
    assert 'time_taken' in result_astar
    assert len(result_astar['path']) == 2 # Start state + 1 move
    print(f"A* Passed: {result_astar['nodes_explored']} nodes explored")

    print("\nTesting BFS...")
    result_bfs = solve_puzzle(start_state, algorithm='bfs')
    assert result_bfs is not None
    assert len(result_bfs['path']) == 2
    print(f"BFS Passed: {result_bfs['nodes_explored']} nodes explored")

    # Moderate case
    # 1 2 3
    # 4 0 5
    # 7 8 6
    start_state_2 = (1, 2, 3, 4, 0, 5, 7, 8, 6)
    
    print("\nTesting Moderate Case A*...")
    result_2_astar = solve_puzzle(start_state_2, 'astar')
    assert result_2_astar is not None
    print(f"A* Solved in {len(result_2_astar['path'])-1} moves, {result_2_astar['nodes_explored']} nodes")

    print("\nTesting Moderate Case BFS...")
    result_2_bfs = solve_puzzle(start_state_2, 'bfs')
    assert result_2_bfs is not None
    print(f"BFS Solved in {len(result_2_bfs['path'])-1} moves, {result_2_bfs['nodes_explored']} nodes")
    
    # Comparison check
    assert len(result_2_astar['path']) == len(result_2_bfs['path']), "Both should find optimal path"
    assert result_2_bfs['nodes_explored'] >= result_2_astar['nodes_explored'], "BFS should explore >= nodes than A*"

if __name__ == "__main__":
    try:
        test_solver()
        print("\nAll tests passed!")
    except AssertionError as e:
        print(f"\nTest failed! {e}")
        raise e
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        raise e
