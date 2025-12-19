from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # e.g., "Wheel Bearing"
    location = Column(String)
    status = Column(String, default="NORMAL")  # NORMAL, WARNING, CRITICAL
    last_updated = Column(DateTime, default=datetime.utcnow)

    sensor_readings = relationship("SensorData", back_populates="asset")
    alerts = relationship("Alert", back_populates="asset")

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Payload fields
    temperature = Column(Float)
    vibration = Column(Float)
    current = Column(Float)
    
    asset = relationship("Asset", back_populates="sensor_readings")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(String)  # low, medium, high, critical
    message = Column(String)
    acknowledged = Column(Boolean, default=False)
    
    asset = relationship("Asset", back_populates="alerts")
