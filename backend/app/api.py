from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app import crud, models, schemas, database

router = APIRouter()

# Dependency
async def get_db_session():
    async with database.AsyncSessionLocal() as session:
        yield session

@router.post("/assets/", response_model=schemas.AssetOut)
async def create_asset(asset: schemas.AssetCreate, db: AsyncSession = Depends(get_db_session)):
    return await crud.create_or_update_asset(db, asset)

@router.get("/assets/", response_model=List[schemas.AssetOut])
async def read_assets(db: AsyncSession = Depends(get_db_session)):
    return await crud.get_assets(db)

@router.get("/assets/{asset_id}", response_model=schemas.AssetOut)
async def read_asset(asset_id: str, db: AsyncSession = Depends(get_db_session)):
    asset = await crud.get_asset(db, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/ingest/")
async def ingest_data(payload: schemas.SensorPayload, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db_session)):
    # In a real high-throughput scenario, we'd push to Redis/Kafka here.
    # For MVP, we process directly or use background tasks.
    # We await here to ensure data consistency for the demo.
    await crud.ingest_sensor_data(db, payload)
    return {"status": "received"}

@router.get("/alerts/", response_model=List[schemas.AlertOut])
async def read_alerts(limit: int = 50, db: AsyncSession = Depends(get_db_session)):
    return await crud.get_alerts(db, limit)
