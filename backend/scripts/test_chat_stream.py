import requests
import json
import sys

def test_chat_stream(message="What is a servo motor?"):
    url = "http://localhost:8000/api/chat/message"
    payload = {
        "message": message,
        "context_limit": 5
    }

    print(f"Sending request to {url} with message: '{message}'...")

    try:
        with requests.post(url, json=payload, stream=True) as response:
            if response.status_code != 200:
                print(f"Error: Status Code {response.status_code}")
                print(response.text)
                return

            print("\n=== Streaming Response ===")
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith("data: "):
                        data_str = decoded_line[6:]
                        if data_str == "[DONE]":
                            print("\n\n[Stream Completed]")
                            break

                        try:
                            data = json.loads(data_str)
                            if data['type'] == 'sources':
                                print("\n[Sources Found]:")
                                for source in data['data']:
                                    print(f"- {source['title']} (Score: {source['score']:.2f})")
                                print("\n[Answer]:", end=" ", flush=True)

                            elif data['type'] == 'content':
                                print(data['delta'], end="", flush=True)

                        except json.JSONDecodeError:
                            print(f"\n[Raw]: {data_str}")
    except Exception as e:
        print(f"\nError connecting to server: {e}")

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "What is a servo motor?"
    test_chat_stream(msg)
