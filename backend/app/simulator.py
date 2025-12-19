import asyncio
import aiohttp
import random
import time
from datetime import datetime, timezone
import json

# Configuration
API_URL = "http://localhost:8000/api/realtime/ingest"  # Endpoint we will create
ASSETS = ["RB-001", "RB-002", "RB-003", "RB-004", "RB-005"]

# Simulation parameters
NORMAL_TEMP_MEAN = 60.0
NORMAL_TEMP_STD = 2.0
NORMAL_VIB_MEAN = 0.02
NORMAL_VIB_STD = 0.005
NORMAL_CUR_MEAN = 10.0
NORMAL_CUR_STD = 1.0

# State to simulate trends
asset_states = {
    asset_id: {
        "temp_trend": 0.0,
        "vib_trend": 0.0,
        "status": "NORMAL"
    } for asset_id in ASSETS
}

def generate_payload(asset_id):
    state = asset_states[asset_id]
    
    # Random walk behavior
    if random.random() < 0.05:  # 5% chance to change trend
        state["temp_trend"] = random.uniform(-0.1, 0.2)
    if random.random() < 0.05:
        state["vib_trend"] = random.uniform(-0.001, 0.002)
        
    # Inject faults occasionally
    if random.random() < 0.01:
        state["status"] = "CRITICAL" if state["status"] == "NORMAL" else "NORMAL"
        print(f"[{datetime.now().time()}] Asset {asset_id} status changed to {state['status']}")

    # Calculate values based on status
    if state["status"] == "NORMAL":
        temp = random.gauss(NORMAL_TEMP_MEAN, NORMAL_TEMP_STD)
        vib = random.gauss(NORMAL_VIB_MEAN, NORMAL_VIB_STD)
        curr = random.gauss(NORMAL_CUR_MEAN, NORMAL_CUR_STD)
    else: # CRITICAL behavior (overheating, high vibration)
        temp = random.gauss(85.0, 5.0)
        vib = random.gauss(0.08, 0.02)
        curr = random.gauss(15.0, 2.0)

    # Apply trends
    temp += state["temp_trend"] * 10 
    vib += state["vib_trend"] * 10
    
    return {
        "asset_id": asset_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "temperature": round(temp, 1),
        "vibration": round(max(0, vib), 3),
        "current": round(max(0, curr), 1)
    }

async def simulate():
    print(f"Starting simulator for {len(ASSETS)} assets...")
    async with aiohttp.ClientSession() as session:
        while True:
            tasks = []
            for asset_id in ASSETS:
                payload = generate_payload(asset_id)
                # print(f"Sending: {payload['asset_id']} T:{payload['temperature']} V:{payload['vibration']}")
                tasks.append(session.post(API_URL, json=payload))
            
            try:
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                # Count successes
                queued = sum(1 for r in responses if not isinstance(r, Exception) and r.status == 200)
                # print(f"  -> queued {queued}/{len(ASSETS)} events")
            except Exception as e:
                print(f"Error sending batch: {e}")
                
            await asyncio.sleep(1.0) # 1Hz frequency

if __name__ == "__main__":
    try:
        asyncio.run(simulate())
    except KeyboardInterrupt:
        print("Simulator stopped.")
