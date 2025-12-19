from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks
from app.realtime import manager
from pydantic import BaseModel

router = APIRouter()

class SensorReading(BaseModel):
    asset_id: str
    timestamp: str
    temperature: float
    vibration: float
    current: float

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open, wait for client messages (if any)
            # In this architecture, clients mostly listen.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/ingest")
async def ingest_data(reading: SensorReading, background_tasks: BackgroundTasks):
    # Offload processing to background task to keep ingestion fast
    background_tasks.add_task(manager.process_reading, reading.model_dump())
    return {"status": "accepted"}
