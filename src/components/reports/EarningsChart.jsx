import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Sen', income: 400000, services: 10 },
    { name: 'Sel', income: 300000, services: 8 },
    { name: 'Rab', income: 500000, services: 12 },
    { name: 'Kam', income: 450000, services: 11 },
    { name: 'Jum', income: 600000, services: 15 },
    { name: 'Sab', income: 800000, services: 20 },
    { name: 'Min', income: 750000, services: 18 },
];

export default function EarningsChart() {
    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--text-main)' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="var(--primary)" fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
