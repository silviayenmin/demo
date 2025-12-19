from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app import models, schemas
from datetime import datetime

# --- Asset Operations ---
async def create_or_update_asset(db: AsyncSession, asset_in: schemas.AssetCreate):
    result = await db.execute(select(models.Asset).filter(models.Asset.id == asset_in.id))
    asset = result.scalars().first()
    
    if not asset:
        asset = models.Asset(**asset_in.model_dump())
        db.add(asset)
    else:
        # Update fields
        for key, value in asset_in.model_dump().items():
            setattr(asset, key, value)
    
    await db.commit()
    await db.refresh(asset)
    return asset

async def get_assets(db: AsyncSession):
    result = await db.execute(select(models.Asset))
    return result.scalars().all()

async def get_asset(db: AsyncSession, asset_id: str):
    result = await db.execute(select(models.Asset).filter(models.Asset.id == asset_id))
    return result.scalars().first()

# --- Ingestion & Analysis ---
async def ingest_sensor_data(db: AsyncSession, payload: schemas.SensorPayload):
    # 1. Save Raw Data
    db_data = models.SensorData(
        asset_id=payload.device_id,
        timestamp=payload.timestamp,
        temperature=payload.temperature,
        vibration=payload.vibration,
        current=payload.current
    )
    db.add(db_data)
    
    # 2. Update Asset Status (Simple Logic for MVP)
    # Rules: Temp > 90 is Critical, > 80 is Warning. Vibration > 0.05 is Warning.
    new_status = "NORMAL"
    severity = None
    alert_msg = None

    if payload.temperature > 90:
        new_status = "CRITICAL"
        severity = "high"
        alert_msg = f"High Temperature detected: {payload.temperature}°C"
    elif payload.temperature > 80:
        new_status = "WARNING"
        severity = "medium"
        alert_msg = f"Elevated Temperature: {payload.temperature}°C"
    
    if payload.vibration > 0.08:
        new_status = "CRITICAL"
        severity = "high"
        alert_msg = f"Severe Vibration detected: {payload.vibration}"
    elif payload.vibration > 0.05 and new_status != "CRITICAL":
        new_status = "WARNING"
        severity = "medium"
        alert_msg = f"Abnormal Vibration: {payload.vibration}"

    # Update Asset
    result = await db.execute(select(models.Asset).filter(models.Asset.id == payload.device_id))
    asset = result.scalars().first()
    if asset:
        asset.status = new_status
        asset.last_updated = payload.timestamp
        
        # Create Alert if needed
        if severity:
            # Check for recent duplicate alert (deduplication logic simplified)
            alert = models.Alert(
                asset_id=asset.id,
                severity=severity,
                message=alert_msg,
                timestamp=payload.timestamp
            )
            db.add(alert)
    
    await db.commit()
    return db_data

async def get_alerts(db: AsyncSession, limit: int = 50):
    result = await db.execute(select(models.Alert).order_by(desc(models.Alert.timestamp)).limit(limit))
    return result.scalars().all()
