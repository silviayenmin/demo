import type { RealtimeSensorData } from '../services/realtime';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface LiveFeedProps {
    data: Record<string, RealtimeSensorData[]>; // asset_id -> readings[]
}

const Sparkline = ({ data, color }: { data: RealtimeSensorData[], color: string }) => (
    <div className="h-8 w-24">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <Area
                    type="monotone"
                    dataKey="vibration"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

export const LiveFeed = ({ data }: LiveFeedProps) => {
    // Get top 3 most recent active assets
    const activeAssets = Object.entries(data)
        .map(([id, readings]) => ({
            id,
            lastReading: readings[readings.length - 1],
            history: readings.slice(-20) // Last 20 points for sparkline
        }))
        .sort((a, b) => new Date(b.lastReading.timestamp).getTime() - new Date(a.lastReading.timestamp).getTime())
        .slice(0, 5);

    return (
        <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                Live Asset Feed
            </h3>
            <div className="space-y-3">
                {activeAssets.map(asset => {
                    const isCritical = asset.lastReading.vibration > 0.06 || asset.lastReading.temperature > 80;
                    const color = isCritical ? '#ef4444' : '#22c55e';

                    return (
                        <div key={asset.id} className="flex items-center justify-between rounded-lg bg-background p-3 text-sm">
                            <div>
                                <div className="font-medium">{asset.id}</div>
                                <div className="text-xs text-muted-foreground">
                                    {asset.lastReading.vibration.toFixed(3)} G / {asset.lastReading.temperature.toFixed(1)}°C
                                </div>
                            </div>
                            <Sparkline data={asset.history} color={color} />
                        </div>
                    );
                })}
                {activeAssets.length === 0 && (
                    <div className="text-sm text-muted-foreground">Waiting for live data...</div>
                )}
            </div>
        </div>
    );
};
