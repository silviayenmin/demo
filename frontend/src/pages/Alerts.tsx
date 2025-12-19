import { useEffect, useState } from 'react';
import { AlertService } from '../services/api';
import type { Alert } from '../services/api';

export const Alerts = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await AlertService.getRecent();
                setAlerts(data);
            } catch (e) {
                setAlerts([
                    { id: 1, asset_id: 'RB-002', timestamp: new Date().toISOString(), severity: 'medium', message: 'Elevated Temperature: 82°C', acknowledged: false },
                    { id: 2, asset_id: 'RB-004', timestamp: new Date().toISOString(), severity: 'high', message: 'Severe Vibration: 0.08', acknowledged: false },
                ]);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Alerts</h2>
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 rounded-lg border border-border p-4 shadow-sm">
                        <div className={`mt-1 h-3 w-3 rounded-full ${alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{alert.message}</h4>
                                <span className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Asset: {alert.asset_id}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
