import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { realtimeService } from '../services/realtime';
import type { RealtimeSensorData } from '../services/realtime';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, Thermometer, Activity, Zap } from 'lucide-react';

export const AssetDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [history, setHistory] = useState<RealtimeSensorData[]>([]);

    useEffect(() => {
        if (!id) return;

        realtimeService.connect();

        const unsubscribe = realtimeService.subscribe((msg) => {
            if (msg.type === 'update' && msg.data.asset_id === id) {
                setHistory(prev => {
                    const newHistory = [...prev, msg.data];
                    // Keep last 300 points (5 minutes at 1s interval)
                    return newHistory.slice(-300);
                });
            }
        });

        return () => unsubscribe();
    }, [id]);

    const latest = history[history.length - 1];

    if (!id) return <div>Invalid Asset ID</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-full p-2 hover:bg-muted"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Asset Monitor: {id}</h2>
                    <p className="text-muted-foreground">Real-time telemetry and diagnostics</p>
                </div>
            </div>

            {/* Current Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Thermometer className="h-4 w-4" /> Temperature
                    </div>
                    <div className="text-2xl font-bold">
                        {latest ? latest.temperature.toFixed(1) : '--'}°C
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Activity className="h-4 w-4" /> Vibration
                    </div>
                    <div className="text-2xl font-bold">
                        {latest ? latest.vibration.toFixed(3) : '--'} G
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Zap className="h-4 w-4" /> Current
                    </div>
                    <div className="text-2xl font-bold">
                        {latest ? latest.current.toFixed(1) : '--'} A
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-semibold">Vibration Analysis</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis domain={[0, 'auto']} stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="vibration"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-semibold">Temperature Trend</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="timestamp" hide />
                                <YAxis domain={['auto', 'auto']} stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
