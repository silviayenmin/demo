import { LayoutDashboard, AlertTriangle, Settings, TrainFront } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: TrainFront, label: 'Assets', path: '/assets' },
        { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
            <div className="flex h-16 items-center border-b border-border px-6">
                <span className="text-xl font-bold text-primary">Fleet Command</span>
            </div>
            <nav className="space-y-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-card/50 px-6 backdrop-blur">
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
