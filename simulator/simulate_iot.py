import requests, random, time, json

API_URL = "https://05xerakx51.execute-api.us-east-1.amazonaws.com/prod/ingest"
DEVICES = ['dev-001', 'dev-002', 'dev-003', 'dev-004', 'dev-005']

def gen_reading(device_id):
    spike = random.random() < 0.05
    return {
        'deviceId': device_id,
        'temperature': round(random.uniform(36, 42) if spike else random.uniform(20, 30), 2),
        'humidity': round(random.uniform(40, 80), 2)
    }

print("Simulator running. Ctrl+C to stop.")
while True:
    for dev in DEVICES:
        payload = gen_reading(dev)
        try:
            r = requests.post(API_URL, json=payload, timeout=5)
            print(f"[{dev}] {payload['temperature']}C -> {r.status_code}")
        except Exception as e:
            print(f"[{dev}] ERROR: {e}")
    time.sleep(1)
