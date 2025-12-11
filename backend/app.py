from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from solver import solve_puzzle

app = Flask(__name__, static_folder='../frontend')
CORS(app)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    start_state = tuple(data.get('state'))
    if not start_state or len(start_state) != 9:
        return jsonify({'error': 'Invalid state'}), 400
    
    algorithm = data.get('algorithm', 'astar')
    max_nodes = data.get('max_nodes', 10000)  # Get custom limit from frontend
    
    print(f"Solving with {algorithm}, max_nodes: {max_nodes}")  # Debug log
    
    try:
        result = solve_puzzle(start_state, algorithm, max_nodes)
        if result is None:
             return jsonify({'error': 'No solution found'}), 404
        
        # Convert tuple states to lists for JSON serialization
        path_list = []
        if result['path']:
            for step in result['path']:
                path_list.append({
                    'state': list(step['state']),
                    'action': step['action']
                })
            
        return jsonify({
            'path': path_list if result['path'] else None,
            'nodes_explored': result['nodes_explored'],
            'time_taken': result['time_taken'],
            'execution_frames': result['execution_frames']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Puerto configurable via variable de entorno (default 5001 para evitar conflictos)
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port)
