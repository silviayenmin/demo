from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class RealtimeSensorData(Base):
    __tablename__ = "realtime_sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, index=True) # Intentionally decoupled from Asset table FK for speed
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Payload fields
    temperature = Column(Float)
    vibration = Column(Float)
    current = Column(Float)

class RealtimeAlert(Base):
    __tablename__ = "realtime_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True) # External ID from alert engine
    asset_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    severity = Column(String) # CRITICAL, WARNING, NORMAL
    reason = Column(String)
    metric = Column(String)
    value = Column(Float)
    acknowledged = Column(Boolean, default=False)
