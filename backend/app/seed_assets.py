import asyncio
from app.database import AsyncSessionLocal
from app.models import Asset
from datetime import datetime

assets = [
    {"id": "RB-001", "name": "Axle #1", "type": "Bearing", "location": "Coach A"},
    {"id": "RB-002", "name": "Axle #2", "type": "Bearing", "location": "Coach A"},
    {"id": "RB-003", "name": "Axle #3", "type": "Bearing", "location": "Coach B"},
    {"id": "RB-004", "name": "Axle #4", "type": "Bearing", "location": "Coach B"},
    {"id": "RB-005", "name": "Axle #5", "type": "Bearing", "location": "Coach C"},
]

async def seed_assets():
    print("Seeding assets...")
    async with AsyncSessionLocal() as db:
        for asset_data in assets:
            existing = await db.get(Asset, asset_data["id"])
            if not existing:
                print(f"Adding {asset_data['id']}")
                asset = Asset(**asset_data, last_updated=datetime.utcnow())
                db.add(asset)
            else:
                print(f"Skipping {asset_data['id']} (already exists)")
        
        await db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_assets())
