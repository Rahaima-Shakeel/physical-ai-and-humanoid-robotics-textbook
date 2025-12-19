import requests
import sys

def debug_deployment(url="http://localhost:8000/api/chat/message"):
    print(f"--- Debugging Deployment: {url} ---")

    payload = {
        "message": "Hello, are you working?",
        "context_limit": 5
    }

    try:
        response = requests.post(url, json=payload, stream=True)
        print(f"Status Code: {response.status_code}")
        print("--- Response Headers ---")
        for k, v in response.headers.items():
            print(f"{k}: {v}")

        print("\n--- Response Body (First 500 chars) ---")
        # Read a bit of the response to see if it's JSON error or stream
        content_sample = b""
        for chunk in response.iter_content(chunk_size=1024):
            content_sample += chunk
            if len(content_sample) > 500:
                break

        print(content_sample.decode('utf-8', errors='replace'))
        print("\n---------------------------------------")

    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api/chat/message"
    debug_deployment(url)
