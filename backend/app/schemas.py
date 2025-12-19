from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Sensor Payload Schema
class SensorPayload(BaseModel):
    device_id: str
    timestamp: datetime
    temperature: float
    vibration: float
    current: float

    class Config:
        from_attributes = True

# Asset Schemas
class AssetBase(BaseModel):
    name: str
    type: str
    location: str

class AssetCreate(AssetBase):
    id: str

class AssetOut(AssetBase):
    id: str
    status: str
    last_updated: datetime

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    timestamp: datetime
    severity: str
    message: str
    acknowledged: bool

class AlertOut(AlertBase):
    id: int
    asset_id: str

    class Config:
        from_attributes = True

# Full Dashboard View
class AssetDetail(AssetOut):
    recent_alerts: List[AlertOut] = []
