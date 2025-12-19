export interface RealtimeSensorData {
    asset_id: string;
    timestamp: string;
    temperature: number;
    vibration: number;
    current: number;
    trend?: "up" | "down" | "stable";
}

export interface RealtimeAlert {
    severity: "CRITICAL" | "WARNING" | "NORMAL";
    message: string;
    metric: string;
    value: number;
}

export interface RealtimeMessage {
    type: "update";
    data: RealtimeSensorData;
    alerts: RealtimeAlert[];
}

type Listener = (data: RealtimeMessage) => void;

class RealtimeService {
    private ws: WebSocket | null = null;
    private listeners: Listener[] = [];
    private reconnectInterval = 3000;

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        // Note: Assuming backend is on localhost:8000 for now, 
        // in prod this would be configurable
        this.ws = new WebSocket('ws://localhost:8000/api/realtime/ws');

        this.ws.onmessage = (event) => {
            try {
                const message: RealtimeMessage = JSON.parse(event.data);
                this.notify(message);
            } catch (e) {
                console.error("Failed to parse realtime message", e);
            }
        };

        this.ws.onclose = () => {
            console.warn("WebSocket disconnected. Retrying...");
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            this.ws?.close();
        };
    }

    subscribe(listener: Listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify(data: RealtimeMessage) {
        this.listeners.forEach(l => l(data));
    }
}

export const realtimeService = new RealtimeService();
