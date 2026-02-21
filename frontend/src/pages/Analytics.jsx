import { useState, useEffect } from 'react'
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Fuel, DollarSign, Truck, MapPin, Download } from 'lucide-react'
import { analyticsApi } from '../services/api'

// ─── Mock Data ──────────────────────────────────────────
const fuelEfficiencyData = [
    { month: 'Jan', efficiency: 8.2 },
    { month: 'Feb', efficiency: 7.8 },
    { month: 'Mar', efficiency: 8.5 },
    { month: 'Apr', efficiency: 9.1 },
    { month: 'May', efficiency: 8.7 },
    { month: 'Jun', efficiency: 9.4 },
    { month: 'Jul', efficiency: 9.8 },
    { month: 'Aug', efficiency: 10.1 },
    { month: 'Sep', efficiency: 9.6 },
    { month: 'Oct', efficiency: 10.3 },
    { month: 'Nov', efficiency: 10.0 },
    { month: 'Dec', efficiency: 10.5 },
]

const costliestVehiclesData = [
    { name: 'TRK-001', cost: 48000 },
    { name: 'TRK-005', cost: 42000 },
    { name: 'VAN-012', cost: 35000 },
    { name: 'TRK-008', cost: 31000 },
    { name: 'VAN-003', cost: 28000 },
]

const revenueVsCostData = [
    { month: 'Jan', revenue: 180000, cost: 120000 },
    { month: 'Feb', revenue: 165000, cost: 110000 },
    { month: 'Mar', revenue: 200000, cost: 130000 },
    { month: 'Apr', revenue: 220000, cost: 140000 },
    { month: 'May', revenue: 195000, cost: 125000 },
    { month: 'Jun', revenue: 240000, cost: 145000 },
]

const vehicleStatusData = [
    { name: 'Available', value: 12, color: '#10b981' },
    { name: 'On Trip', value: 8, color: '#3b82f6' },
    { name: 'In Shop', value: 3, color: '#f59e0b' },
    { name: 'Out of Service', value: 2, color: '#ef4444' },
]

const tripStatusData = [
    { name: 'Completed', value: 156, color: '#10b981' },
    { name: 'Dispatched', value: 24, color: '#3b82f6' },
    { name: 'Draft', value: 8, color: '#9ca3af' },
    { name: 'Cancelled', value: 12, color: '#ef4444' },
]

const maintenanceTrendData = [
    { month: 'Jan', cost: 15000, count: 4 },
    { month: 'Feb', cost: 22000, count: 6 },
    { month: 'Mar', cost: 18000, count: 5 },
    { month: 'Apr', cost: 12000, count: 3 },
    { month: 'May', cost: 25000, count: 7 },
    { month: 'Jun', cost: 20000, count: 5 },
]

const driverPerformanceData = [
    { name: 'Rahul', score: 96, trips: 28 },
    { name: 'Amit', score: 92, trips: 25 },
    { name: 'Suresh', score: 89, trips: 30 },
    { name: 'Vijay', score: 85, trips: 22 },
    { name: 'Manoj', score: 94, trips: 27 },
]

const expenseBreakdownData = [
    { name: 'Fuel', value: 45, color: '#f59e0b' },
    { name: 'Maintenance', value: 25, color: '#3b82f6' },
    { name: 'Tolls', value: 15, color: '#10b981' },
    { name: 'Insurance', value: 10, color: '#8b5cf6' },
    { name: 'Other', value: 5, color: '#6b7280' },
]

const financialSummaryData = [
    { month: 'Jan', revenue: '₹1,80,000', fuelCost: '₹60,000', maintenance: '₹15,000', tolls: '₹12,000', netProfit: '₹93,000' },
    { month: 'Feb', revenue: '₹1,65,000', fuelCost: '₹55,000', maintenance: '₹22,000', tolls: '₹10,000', netProfit: '₹78,000' },
    { month: 'Mar', revenue: '₹2,00,000', fuelCost: '₹65,000', maintenance: '₹18,000', tolls: '₹14,000', netProfit: '₹1,03,000' },
    { month: 'Apr', revenue: '₹2,20,000', fuelCost: '₹70,000', maintenance: '₹12,000', tolls: '₹11,000', netProfit: '₹1,27,000' },
    { month: 'May', revenue: '₹1,95,000', fuelCost: '₹58,000', maintenance: '₹25,000', tolls: '₹13,000', netProfit: '₹99,000' },
    { month: 'Jun', revenue: '₹2,40,000', fuelCost: '₹72,000', maintenance: '₹20,000', tolls: '₹15,000', netProfit: '₹1,33,000' },
]

const odometerData = [
    { month: 'Jan', km: 12400 },
    { month: 'Feb', km: 11800 },
    { month: 'Mar', km: 14200 },
    { month: 'Apr', km: 15600 },
    { month: 'May', km: 13400 },
    { month: 'Jun', km: 16100 },
]

// ─── KPI Card Component ────────────────────────────────
function KpiCard({ icon: Icon, label, value, change, changeType, color }) {
    return (
        <div className="kpi-card">
            <div className="kpi-icon" style={{ background: `${color}15`, color }}>
                <Icon size={22} />
            </div>
            <div className="kpi-info">
                <span className="kpi-label">{label}</span>
                <span className="kpi-value">{value}</span>
                {change && (
                    <span className={`kpi-change ${changeType === 'up' ? 'kpi-up' : 'kpi-down'}`}>
                        {changeType === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {change}
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Chart Card Component ───────────────────────────────
function ChartCard({ title, children, span }) {
    return (
        <div className={`chart-card ${span === 2 ? 'chart-span-2' : ''}`}>
            <h3 className="chart-title">{title}</h3>
            <div className="chart-body">
                {children}
            </div>
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────
function Analytics() {
    const [period] = useState('6 Months')
    const [roi, setRoi] = useState(null)
    const [fuelEff, setFuelEff] = useState(null)

    useEffect(() => {
        analyticsApi.getRoi().then(d => setRoi(d.roi_percentage)).catch(() => { })
        analyticsApi.getFuelEfficiency().then(d => setFuelEff(d.fuel_efficiency_km_per_l)).catch(() => { })
    }, [])

    const handleExport = async () => {
        try {
            const response = await analyticsApi.exportReport()
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'monthly_fleet_report.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
            alert('Export failed. Please try again.')
        }
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">Operational Analytics &amp; Financial Reports</h2>
                <button className="btn btn-primary" onClick={handleExport}>
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* ── KPI Cards ──────────────────────────── */}
            <div className="kpi-grid">
                <KpiCard
                    icon={Fuel}
                    label="Total Fuel Cost"
                    value="₹2,60,000"
                    change="+8.2% vs last quarter"
                    changeType="up"
                    color="#f59e0b"
                />
                <KpiCard
                    icon={DollarSign}
                    label="Fleet ROI"
                    value={roi !== null ? `${roi > 0 ? '+' : ''}${roi}%` : 'Loading...'}
                    color="#10b981"
                />
                <KpiCard
                    icon={Truck}
                    label="Fuel Efficiency"
                    value={fuelEff !== null ? `${fuelEff} km/L` : 'Loading...'}
                    color="#3b82f6"
                />
                <KpiCard
                    icon={MapPin}
                    label="Total Distance"
                    value="83,500 km"
                    change="+12% vs last quarter"
                    changeType="up"
                    color="#8b5cf6"
                />
            </div>

            {/* ── Charts Grid ────────────────────────── */}
            <div className="charts-grid">

                {/* Chart 1: Fuel Efficiency Trend */}
                <ChartCard title="Fuel Efficiency Trend (km/L)">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={fuelEfficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 2: Top 5 Costliest Vehicles */}
                <ChartCard title="Top 5 Costliest Vehicles (₹)">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={costliestVehiclesData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis dataKey="name" type="category" fontSize={12} tick={{ fill: '#6b7280' }} width={70} />
                            <Tooltip
                                formatter={(val) => [`₹${val.toLocaleString()}`, 'Total Cost']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="cost" fill="#ef4444" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 3: Revenue vs Cost */}
                <ChartCard title="Revenue vs Operating Cost" span={2}>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={revenueVsCostData}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                            <Tooltip
                                formatter={(val) => `₹${val.toLocaleString()}`}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#revGrad)" strokeWidth={2} />
                            <Area type="monotone" dataKey="cost" stroke="#ef4444" fillOpacity={1} fill="url(#costGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 4: Vehicle Status Distribution */}
                <ChartCard title="Vehicle Status Distribution">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                {vehicleStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 5: Trip Status Breakdown */}
                <ChartCard title="Trip Status Breakdown">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={tripStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                                {tripStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 6: Maintenance Cost Trend */}
                <ChartCard title="Maintenance Cost & Frequency">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={maintenanceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis yAxisId="left" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis yAxisId="right" orientation="right" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="cost" name="Cost (₹)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="count" name="Services" stroke="#f59e0b" strokeWidth={2} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 7: Expense Breakdown */}
                <ChartCard title="Expense Category Breakdown">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={expenseBreakdownData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`} fontSize={11}>
                                {expenseBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 8: Driver Performance */}
                <ChartCard title="Driver Performance Scores">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={driverPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis domain={[70, 100]} fontSize={12} tick={{ fill: '#6b7280' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Bar dataKey="score" name="Safety Score" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Chart 9: Fleet Distance Covered */}
                <ChartCard title="Fleet Total Distance Covered (km)">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={odometerData}>
                            <defs>
                                <linearGradient id="kmGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={12} tick={{ fill: '#6b7280' }} />
                            <YAxis fontSize={12} tick={{ fill: '#6b7280' }} />
                            <Tooltip
                                formatter={(val) => [`${val.toLocaleString()} km`, 'Distance']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Area type="monotone" dataKey="km" stroke="#8b5cf6" fill="url(#kmGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── Financial Summary Table ───────────── */}
            <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-800)' }}>Financial Summary of Month</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Revenue</th>
                                <th>Fuel Cost</th>
                                <th>Maintenance</th>
                                <th>Tolls</th>
                                <th>Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financialSummaryData.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{row.month}</td>
                                    <td style={{ color: 'var(--primary-green)' }}>{row.revenue}</td>
                                    <td>{row.fuelCost}</td>
                                    <td>{row.maintenance}</td>
                                    <td>{row.tolls}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-green)' }}>{row.netProfit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Analytics
