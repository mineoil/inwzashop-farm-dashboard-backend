import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Zap, Users, CheckSquare, Clock, CloudOff, Diamond, Award, Coins } from 'lucide-react';

// --- Configuration ---
// **สำคัญ:** เปลี่ยน URL นี้เป็น WebSocket URL ที่ Render หรือ Server ของคุณจะให้มา 
// ใช้ URL ของ Render ที่ท่านได้มา: https://inwzashop-farm-dashboard-backend-1.onrender.com/
const REALTIME_API_ENDPOINT = "wss://inwzashop-farm-dashboard-backend-1.onrender.com/ws"; 
// หมายเหตุ: ต้องใช้ 'wss' แทน 'https' สำหรับ WebSocket Secure

// --- Mock Data Function (ใช้สำหรับโหลดเริ่มต้นเท่านั้น) ---
const initialMockData = {
    statistics: { gemsTotal: 0, traitsTotal: 0, goldTotal: 0, runtime: '00:00:00', matchWinRate: '0/0 (0%)', completedOrders: 0, totalAccounts: 0 },
    recentOrders: [
        { name: 'Loading..', item: 'Waiting for connection', price: 0.00 }
    ],
    topBuyers: [
        { name: 'Neo', spent: 50000.00 },
        { name: 'Trinity', spent: 35000.00 },
        { name: 'Morpheus', spent: 15000.00 }
    ],
    challengeStatus: [
        { title: 'Weekly Gem Challenge', gems: 15000, traits: 5, golds: 5000, next: '12 hours' },
        { title: 'Monthly Trait Goal', gems: 30000, traits: 10, golds: 10000, next: '5 days' },
        { title: 'Daily Gold Bounty', gems: 500, golds: 1500, next: '2 hours' }
    ]
};


// --- Sub Components ---

const StatisticCard = ({ title, value, icon, subText, accentColor, isUpdating }) => (
    <div 
        className={`p-5 rounded-xl border border-white/10 shadow-lg transition duration-300
                    bg-[#252525] hover:shadow-[0_0_15px_${accentColor}80]
                    ${isUpdating ? 'animate-pulse-once' : ''}`}
    >
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-white/60">{title}</p>
            {React.cloneElement(icon, { className: `h-6 w-6 ${accentColor}` })}
        </div>
        <span className={`text-3xl font-mono font-bold block ${accentColor}`}>{value}</span>
        <p className="text-xs mt-1 text-white/50">{subText}</p>
    </div>
);

const TaskStatusCard = ({ status }) => (
    <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-inner border border-white/10">
        <h3 className="text-xl font-mono font-bold mb-3 text-[#00CED1] border-b border-white/10 pb-1">
            {status.title.toUpperCase()}
        </h3>
        <ul className="text-sm space-y-2">
            <li className="flex justify-between items-center text-white/80">
                <span className="flex items-center"><Diamond className="h-4 w-4 mr-2 text-red-400" /> Gems:</span>
                <span className="font-mono text-red-400 font-semibold">{status.gems.toLocaleString()}</span>
            </li>
            {status.traits !== undefined && (
                <li className="flex justify-between items-center text-white/80">
                    <span className="flex items-center"><Award className="h-4 w-4 mr-2 text-yellow-400" /> Traits:</span>
                    <span className="font-mono text-yellow-400 font-semibold">{status.traits.toLocaleString()}</span>
                </li>
            )}
            <li className="flex justify-between items-center text-white/80">
                <span className="flex items-center"><Coins className="h-4 w-4 mr-2 text-amber-500" /> Golds:</span>
                <span className="font-mono text-amber-500 font-semibold">{status.golds.toLocaleString()}</span>
            </li>
            <li className="text-xs pt-1 border-t border-white/5 mt-2 text-white/60">
                Next Check: <span className="text-[#00CED1]">{status.next}</span>
            </li>
        </ul>
    </div>
);


// --- Main App Component ---

export default function App() {
    const [dashboardData, setDashboardData] = useState(initialMockData);
    const [updatingStats, setUpdatingStats] = useState({});
    const [isWsConnected, setIsWsConnected] = useState(false);
    const wsRef = useRef(null); 

    const handleUpdate = useCallback((newStats) => {
        setDashboardData(prevData => {
            const changes = {};
            // ตรวจสอบการเปลี่ยนแปลงเพื่อ trigger animation
            if (newStats.gemsTotal !== prevData.statistics.gemsTotal) changes.gems = true;
            if (newStats.goldTotal !== prevData.statistics.goldTotal) changes.gold = true;
            
            setUpdatingStats(changes);
            setTimeout(() => setUpdatingStats({}), 600);

            return {
                ...prevData,
                statistics: { ...prevData.statistics, ...newStats }
            };
        });
    }, []);

    // Effect สำหรับการจัดการ WebSocket Connection
    useEffect(() => {
        // ฟังก์ชันเชื่อมต่อ WebSocket
        const connectWs = () => {
            // ดึง URL ที่เป็น wss:// จาก REALTIME_API_ENDPOINT
            const wsUrl = REALTIME_API_ENDPOINT;

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('WebSocket Connected to Inwzashop Server.');
                setIsWsConnected(true);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'GLOBAL_STATS') {
                        // **สำคัญ:** รับข้อมูลสถิติที่ Server Push มา
                        handleUpdate(data.data);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket Disconnected. Reconnecting in 3s...');
                setIsWsConnected(false);
                // พยายามเชื่อมต่อใหม่หลังจาก 3 วินาที
                setTimeout(connectWs, 3000); 
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
                wsRef.current.close(); 
            };
        };

        connectWs();

        // Cleanup function
        return () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [handleUpdate]);


    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans pb-10">
            <style jsx global>{`
                /* Global CSS for aesthetic */
                body { font-family: 'Inter', sans-serif; }
                .text-[#00CED1] { color: #00CED1; }
                .shadow-glow { box-shadow: 0 0 5px #00CED1; }
                .animate-pulse-once { animation: glow 0.5s ease-in-out 2 alternate; }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 5px rgba(0, 206, 209, 0.5); }
                    50% { box-shadow: 0 0 15px #00CED1; }
                }
                .marquee-container {
                    animation: marquee 10s linear infinite;
                    display: inline-block;
                    white-space: nowrap;
                    padding-right: 100%;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
            
            {/* Header / Navigation Bar */}
            <header className="bg-[#0f0f0f] border-b border-[#00CED1]/30 p-4 shadow-xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap">
                    <div className="text-2xl md:text-3xl font-mono font-bold text-[#00CED1] tracking-widest cursor-pointer">
                        INWZASHOP<span className="text-white/70 text-sm ml-1">FARMING STATUS</span>
                    </div>
                    <div className="flex space-x-3 items-center mt-2 md:mt-0">
                        <span className={`text-xs px-3 py-1 rounded-full font-mono ${isWsConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {isWsConnected ? 'WS: CONNECTED' : 'WS: DISCONNECTED'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <h1 className="text-3xl md:text-4xl font-mono font-light mb-8 text-white/90">
                    <span className="text-[#00CED1]">/</span>GLOBAL<span className="text-[#00CED1]">_</span>STATISTICS
                </h1>

                {/* 1. Global Macro/Runtime Status */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatisticCard
                        title="Macro Runtime (Hrs:Min:Sec)"
                        value={dashboardData.statistics.runtime}
                        icon={<Clock />}
                        subText="ระยะเวลาที่บอททำงานต่อเนื่อง"
                        accentColor="text-white"
                    />
                    <StatisticCard
                        title="Match Win Rate"
                        value={dashboardData.statistics.matchWinRate}
                        icon={<Award />}
                        subText="อัตราการชนะในแมตช์รวม"
                        accentColor="text-green-400"
                    />
                    <StatisticCard
                        title="Total Gems"
                        value={dashboardData.statistics.gemsTotal.toLocaleString()}
                        icon={<Diamond />}
                        subText={`Traits รวม: ${dashboardData.statistics.traitsTotal}`}
                        accentColor="text-red-400"
                        isUpdating={updatingStats.gems}
                    />
                    <StatisticCard
                        title="Total Golds"
                        value={dashboardData.statistics.goldTotal.toLocaleString()}
                        icon={<Coins />}
                        subText={`บัญชีที่ใช้งาน: ${dashboardData.statistics.totalAccounts}`}
                        accentColor="text-amber-500"
                        isUpdating={updatingStats.gold}
                    />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 2. Challenge/Bounty Status (Main Content - 3/4 Width) */}
                    <section className="lg:col-span-3">
                        <h2 className="text-2xl font-mono font-light mb-4 text-white/80 border-b border-white/10 pb-2">
                            SUB-MISSION STATUS (ภารกิจย่อย)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {dashboardData.challengeStatus.map((status, index) => (
                                <TaskStatusCard key={index} status={status} />
                            ))}
                        </div>
                    </section>

                    {/* 3. Side Panel (1/4 Width) */}
                    <aside className="lg:col-span-1 space-y-6">

                        {/* Recent Orders (Marquee) */}
                        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-2xl border border-[#00CED1]/20">
                            <h3 className="text-xl font-mono font-light mb-3 text-white/80 border-b border-white/10 pb-2">
                                RECENT ORDERS
                            </h3>
                            <div className="h-40 border border-white/10 rounded-lg overflow-hidden relative">
                                <div className="marquee-container">
                                    <div className="space-y-2 inline-block">
                                        {[...dashboardData.recentOrders, ...dashboardData.recentOrders, ...dashboardData.recentOrders].map((order, index) => (
                                            <span key={index} className="flex justify-between items-center text-white/80 p-2 bg-[#1e1e1e]/50 border-l-4 border-[#00CED1]/50 mr-4 inline-block w-[200px] text-xs">
                                                <span>{order.name}: {order.item}</span>
                                                <span className="text-green-400 font-bold ml-2">${order.price.toFixed(2)}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-white/50 mt-2">Streaming live transactions...</p>
                        </div>

                        {/* Top Buyers */}
                        <div className="bg-[#1e1e1e] p-4 rounded-xl shadow-2xl border border-[#6a0dad]/20">
                            <h3 className="text-xl font-mono font-light mb-3 text-white/80 border-b border-white/10 pb-2">
                                TOP BUYERS
                            </h3>
                            <ol className="space-y-2 list-decimal list-inside text-sm">
                                {dashboardData.topBuyers.map((buyer, index) => (
                                    <li key={index} className="text-white/90 truncate">
                                        <span className="font-bold text-[#6a0dad] mr-2">{index + 1}.</span> {buyer.name} <span className="text-xs text-white/60">(${(buyer.spent).toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
