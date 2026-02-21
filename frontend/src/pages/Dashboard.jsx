import { useState, useEffect } from 'react'
import { Activity, Truck, Users, Wrench } from 'lucide-react'
import { analyticsApi } from '../services/api'

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const data = await analyticsApi.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Command Center</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--primary-blue)' }}>
                            <Truck size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Active Fleet</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>{stats?.active_fleet || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--primary-green)' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Pending Cargo</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>{stats?.pending_cargo || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--status-maintenance)' }}>
                            <Wrench size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Maintenance Alerts</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>{stats?.maintenance_alerts || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--white)', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: 'rgba(107, 114, 128, 0.1)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--gray-600)' }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Utilization Rate</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>{stats?.utilization_rate_percent || 0}%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* We can expand on this with charts later. */}
        </div>
    )
}

export default Dashboard
