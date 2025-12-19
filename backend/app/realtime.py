from fastapi import WebSocket
from typing import List, Dict
import asyncio
import json
import random
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models_realtime import RealtimeSensorData, RealtimeAlert
from app.database import AsyncSessionLocal

class RealtimeManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # In-memory rolling window for processing
        # format: {asset_id: [readings...]}
        self.rolling_windows: Dict[str, List[dict]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Broadcast to all connected clients
        payload = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                # Handle disconnected clients gracefully
                pass

    async def process_reading(self, reading: dict):
        """
        1. Access in-memory window
        2. Compute Derived Metrics (Trend, Anomaly)
        3. Check Alerts
        4. Persist Data
        5. Broadcast Update
        """
        asset_id = reading["asset_id"]
        
        # 1. Update Window (keep last 60 points)
        if asset_id not in self.rolling_windows:
            self.rolling_windows[asset_id] = []
        
        window = self.rolling_windows[asset_id]
        window.append(reading)
        if len(window) > 60:
            window.pop(0)

        # 2. Compute Trends (Simple linear delta for now)
        trend = "stable"
        if len(window) >= 5:
            last_5 = window[-5:]
            start_vib = last_5[0]["vibration"]
            end_vib = last_5[-1]["vibration"]
            if end_vib > start_vib * 1.1:
                trend = "up"
            elif end_vib < start_vib * 0.9:
                trend = "down"

        reading["trend"] = trend

        # 3. Alert Logic (Rule-based)
        alerts = []
        if reading["temperature"] > 80.0:
            alerts.append({
                "severity": "CRITICAL",
                "message": "High Temperature Warning",
                "metric": "temperature",
                "value": reading["temperature"]
            })
        if reading["vibration"] > 0.06:
            alerts.append({
                "severity": "WARNING",
                "message": "Abnormal Vibration",
                "metric": "vibration",
                "value": reading["vibration"]
            })

        # 4. Persist (Async)
        async with AsyncSessionLocal() as db:
            # Save Reading
            db_reading = RealtimeSensorData(
                asset_id=reading["asset_id"],
                timestamp=datetime.fromisoformat(reading["timestamp"].replace("Z", "+00:00")).replace(tzinfo=None),
                temperature=reading["temperature"],
                vibration=reading["vibration"],
                current=reading["current"]
            )
            db.add(db_reading)
            
            # Save Alerts
            for alert in alerts:
                db_alert = RealtimeAlert(
                    alert_id=f"ALT-{int(datetime.now().timestamp())}-{asset_id}-{random.randint(0, 1000)}",
                    asset_id=asset_id,
                    timestamp=datetime.utcnow(),
                    severity=alert["severity"],
                    reason=alert["message"],
                    metric=alert["metric"],
                    value=alert["value"]
                )
                db.add(db_alert)
            
            await db.commit()

        # 5. Broadcast (Fire and Forget)
        # We broadcast the RAW reading + any generated alerts
        msg = {
            "type": "update",
            "data": reading,
            "alerts": alerts
        }
        await self.broadcast(msg)

manager = RealtimeManager()
