import { useEffect, useState } from 'react';
import { AssetService } from '../services/api';
import type { Asset } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Assets = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Mock data logic specific for this page if API fails
        const fetchAssets = async () => {
            try {
                const data = await AssetService.getAll();
                setAssets(data);
            } catch (e) {
                setAssets([
                    { id: 'RB-001', name: 'Axle #1', type: 'Bearing', location: 'Coach A', status: 'NORMAL', last_updated: new Date().toISOString() },
                    { id: 'RB-002', name: 'Axle #2', type: 'Bearing', location: 'Coach A', status: 'WARNING', last_updated: new Date().toISOString() },
                    { id: 'RB-003', name: 'Axle #3', type: 'Bearing', location: 'Coach B', status: 'NORMAL', last_updated: new Date().toISOString() },
                    { id: 'RB-004', name: 'Axle #4', type: 'Bearing', location: 'Coach B', status: 'CRITICAL', last_updated: new Date().toISOString() },
                    { id: 'RB-005', name: 'Axle #5', type: 'Bearing', location: 'Coach C', status: 'NORMAL', last_updated: new Date().toISOString() },
                ]);
            }
        };
        fetchAssets();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Fleet Assets</h2>
            <div className="rounded-md border border-border">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="p-4 text-left font-medium">Asset ID</th>
                            <th className="p-4 text-left font-medium">Name</th>
                            <th className="p-4 text-left font-medium">Type</th>
                            <th className="p-4 text-left font-medium">Location</th>
                            <th className="p-4 text-left font-medium">Status</th>
                            <th className="p-4 text-left font-medium">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr
                                key={asset.id}
                                className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/assets/${asset.id}`)}
                            >
                                <td className="p-4 font-medium">{asset.id}</td>
                                <td className="p-4">{asset.name}</td>
                                <td className="p-4">{asset.type}</td>
                                <td className="p-4">{asset.location}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${asset.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                                        asset.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-green-500/10 text-green-500'
                                        }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">{new Date(asset.last_updated).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
