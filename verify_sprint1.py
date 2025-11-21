import requests
import json

url = 'http://localhost:5000/solve'
data = {
    'state': [1, 2, 3, 4, 5, 6, 7, 0, 8],
    'algorithm': 'bfs'
}

try:
    response = requests.post(url, json=data)
    if response.status_code == 200:
        result = response.json()
        if 'execution_frames' in result:
            frames = result['execution_frames']
            print(f"[SUCCESS] Received {len(frames)} frames.")
            if len(frames) > 0:
                first_frame = frames[0]
                required_keys = ['step', 'node', 'level', 'action', 'parent']
                missing_keys = [k for k in required_keys if k not in first_frame]
                if not missing_keys:
                    print("[OK] Frame structure is correct.")
                    print("Sample Frame:", json.dumps(first_frame, indent=2))
                else:
                    print(f"[ERROR] Frame missing keys: {missing_keys}")
        else:
            print("[ERROR] 'execution_frames' key missing in response.")
    else:
        print(f"[ERROR] Request failed with status {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"[ERROR] Error: {e}")
