import { useEffect, useState } from 'react';
import { AssetService } from '../services/api';
import type { Asset } from '../services/api';
import { realtimeService } from '../services/realtime';
import type { RealtimeSensorData } from '../services/realtime';
import { LiveFeed } from '../components/LiveFeed';
import { FleetRiskChart } from '../components/FleetRiskChart';
import { Activity, AlertTriangle, CheckCircle, Smartphone, Info } from 'lucide-react';


const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <h3 className="mt-2 text-2xl font-bold flex items-baseline gap-2">
                    {value}
                    {/* Add trend indicator if real-time update happened recently */}
                    <span className="text-xs font-normal text-muted-foreground animate-pulse">●</span>
                </h3>
            </div>
            <div className={`rounded-full p-3 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </div>
);

const TooltipWrapper = ({ children, content }: { children: React.ReactNode, content: string }) => (
    <div className="group relative flex">
        {children}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-xs rounded border border-border shadow-md z-50">
            {content}
        </span>
    </div>
);

export const Dashboard = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [realtimeData, setRealtimeData] = useState<Record<string, RealtimeSensorData[]>>({});
    const [loading, setLoading] = useState(true);
    const [riskHistory, setRiskHistory] = useState<any[]>([]);

    // Initialize mock history for the chart on load
    useEffect(() => {
        const now = new Date();
        const initialHistory = Array.from({ length: 10 }).map((_, i) => {
            const time = new Date(now.getTime() - (9 - i) * 60000); // Last 10 minutes
            return {
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                healthy: 40 + Math.floor(Math.random() * 5),
                warning: 2 + Math.floor(Math.random() * 3),
                critical: Math.floor(Math.random() * 2)
            };
        });
        setRiskHistory(initialHistory);
    }, []);

    // Connect to WebSocket on mount
    useEffect(() => {
        realtimeService.connect();

        const unsubscribe = realtimeService.subscribe((msg) => {
            if (msg.type === 'update') {
                const { data } = msg;

                // Update Realtime Data for LiveFeed
                setRealtimeData(prev => {
                    const currentHistory = prev[data.asset_id] || [];
                    const newHistory = [...currentHistory, data].slice(-60); // Keep last 60 points
                    return { ...prev, [data.asset_id]: newHistory };
                });

                // Update Risk History (Throttled or simulated based on aggregation)
                // In a real app, this would come from a separate aggregate stream or be computed
                setAssets(currentAssets => {
                    // Update the specific asset in the assets list
                    const updatedAssets = currentAssets.map(a =>
                        a.id === data.asset_id ? { ...a, last_updated: new Date().toISOString() } : a
                    );

                    // Calculate new stats
                    const stats = {
                        healthy: updatedAssets.filter(a => a.status === 'NORMAL').length,
                        warning: updatedAssets.filter(a => a.status === 'WARNING').length,
                        critical: updatedAssets.filter(a => a.status === 'CRITICAL').length,
                    };

                    setRiskHistory(prev => {
                        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const lastEntry = prev[prev.length - 1];

                        // Only add new entry if minute changed
                        if (lastEntry && lastEntry.time === nowStr) {
                            // Update last entry
                            return [
                                ...prev.slice(0, -1),
                                { time: nowStr, ...stats }
                            ];
                        } else {
                            // Add new entry and keep last 20
                            return [...prev, { time: nowStr, ...stats }].slice(-20);
                        }
                    });

                    return updatedAssets;
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // MOCK DATA GENERATOR (Since we can't connect to backend yet)
    // In production, this would be replaced by actual API calls
    const loadMockData = () => {
        const mockAssets: Asset[] = [
            { id: 'RB-001', name: 'Axle #1', type: 'Bearing', location: 'Coach A', status: 'NORMAL', last_updated: new Date().toISOString() },
            { id: 'RB-002', name: 'Axle #2', type: 'Bearing', location: 'Coach A', status: 'WARNING', last_updated: new Date().toISOString() },
            { id: 'RB-003', name: 'Axle #3', type: 'Bearing', location: 'Coach B', status: 'NORMAL', last_updated: new Date().toISOString() },
            { id: 'RB-004', name: 'Axle #4', type: 'Bearing', location: 'Coach B', status: 'CRITICAL', last_updated: new Date().toISOString() },
            { id: 'RB-005', name: 'Axle #5', type: 'Bearing', location: 'Coach C', status: 'NORMAL', last_updated: new Date().toISOString() },
        ];
        setAssets(mockAssets);
        setLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to fetch real data
                const assetsData = await AssetService.getAll();
                setAssets(assetsData);
            } catch (error) {
                console.warn("Backend not reachable, loading mocks for demo");
                loadMockData();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = {
        total: assets.length,
        critical: assets.filter(a => a.status === 'CRITICAL').length,
        warning: assets.filter(a => a.status === 'WARNING').length,
        normal: assets.filter(a => a.status === 'NORMAL').length,
    };



    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Assets" value={stats.total} icon={Smartphone} color="bg-blue-500/10 text-blue-500" />
                <StatCard label="Critical Status" value={stats.critical} icon={AlertTriangle} color="bg-red-500/10 text-red-500" />
                <StatCard label="Warnings" value={stats.warning} icon={Activity} color="bg-yellow-500/10 text-yellow-500" />
                <StatCard label="Healthy" value={stats.normal} icon={CheckCircle} color="bg-green-500/10 text-green-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <LiveFeed data={realtimeData} />

                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Fleet System Reliability</h3>
                            <TooltipWrapper content="Real-time trend of fleet health states over the last 20 minutes.">
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipWrapper>
                        </div>
                        <FleetRiskChart data={riskHistory} />
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 text-lg font-semibold">Critical Assets Attention Required</h3>
                    <div className="space-y-4">
                        {assets.filter(a => a.status !== 'NORMAL').map(asset => (
                            <div key={asset.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div>
                                    <p className="font-medium">{asset.name}</p>
                                    <p className="text-sm text-muted-foreground">{asset.type} • {asset.location}</p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${asset.status === 'CRITICAL'
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {asset.status}
                                </span>
                            </div>
                        ))}
                        {assets.filter(a => a.status !== 'NORMAL').length === 0 && (
                            <p className="text-muted-foreground">System healthy. No urgent issues.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
