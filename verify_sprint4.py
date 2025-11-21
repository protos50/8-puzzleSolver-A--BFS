import requests
import json
import sys

def verify_sprint4():
    url = 'http://localhost:5000/solve'
    payload = {
        'state': [1, 2, 3, 4, 5, 6, 7, 8, 0], # Solved state, should be instant
        'algorithm': 'bfs'
    }
    
    # Test with a simple shuffle to ensure some exploration
    # 1 2 3
    # 4 5 6
    # 7 0 8
    payload['state'] = [1, 2, 3, 4, 5, 6, 7, 0, 8] 

    try:
        print("Sending request to backend...")
        response = requests.post(url, json=payload)
        
        if response.status_code != 200:
            print(f"Error: Status code {response.status_code}")
            print(response.text)
            return False

        data = response.json()
        
        if 'execution_frames' not in data:
            print("Error: 'execution_frames' missing from response")
            return False
            
        frames = data['execution_frames']
        if not frames:
            print("Error: No frames returned")
            return False
            
        print(f"Received {len(frames)} frames.")
        
        # Check first few frames for queue_snapshot
        has_snapshot = False
        for i, frame in enumerate(frames[:5]):
            if 'queue_snapshot' in frame:
                snapshot = frame['queue_snapshot']
                if 'next_up' in snapshot and 'rest' in snapshot:
                    print(f"Frame {i}: Queue Snapshot found.")
                    print(f"  Next Up: {len(snapshot['next_up'])} items")
                    print(f"  Rest: {len(snapshot['rest'])} items")
                    has_snapshot = True
                    
                    # Validate structure
                    if len(snapshot['next_up']) > 0:
                        if 'state' not in snapshot['next_up'][0]:
                             print("Error: 'state' missing in next_up item")
                             return False
                    break
        
        if not has_snapshot:
            print("Error: No queue_snapshot found in first 5 frames")
            return False
            
        print("SUCCESS: Queue Snapshot structure verified.")
        return True

    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    if verify_sprint4():
        sys.exit(0)
    else:
        sys.exit(1)
