import { useState, useEffect } from 'react'
import { Plus, Search, Wrench, CheckCircle } from 'lucide-react'
import { maintenanceApi, vehicleApi } from '../services/api'

function Maintenance() {
    const [logs, setLogs] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        vehicle_id: '',
        service_type: '',
        description: '',
        cost: '',
        date: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [completingLog, setCompletingLog] = useState(null)

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [logsData, vehiclesData] = await Promise.all([
                maintenanceApi.getAll(),
                vehicleApi.getAll()
            ])
            setLogs(logsData)
            setVehicles(vehiclesData)
        } catch (error) {
            console.error('Failed to fetch maintenance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            await maintenanceApi.create({
                vehicle_id: parseInt(formData.vehicle_id),
                service_type: formData.service_type,
                description: formData.description || undefined,
                cost: parseFloat(formData.cost),
                date: formData.date
            })
            setFormData({ vehicle_id: '', service_type: '', description: '', cost: '', date: '' })
            setShowForm(false)
            fetchAll()
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Failed to log maintenance.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCompleteService = async (logId) => {
        setCompletingLog(logId)
        try {
            await maintenanceApi.completeService(logId)
            fetchAll()
        } catch (err) {
            const detail = err?.response?.data?.detail
            alert(typeof detail === 'string' ? detail : 'Failed to complete service.')
        } finally {
            setCompletingLog(null)
        }
    }

    const vehicleMap = {}
    vehicles.forEach(v => { vehicleMap[v.id] = v })

    const filteredLogs = logs.filter(log =>
        log.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(log.vehicle_id).includes(searchTerm)
    )

    // Common service types
    const serviceTypes = [
        'Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Tune-Up',
        'Air Filter Replacement', 'Transmission Service', 'Battery Replacement',
        'Coolant Flush', 'Wheel Alignment', 'Annual Inspection', 'Other'
    ]

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Maintenance Logs</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by service type or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-primary" onClick={() => setShowForm(prev => !prev)}>
                        <Plus size={16} />
                        {showForm ? 'Close Form' : 'New Log'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Log Maintenance Service</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                        ⚠️ Logging a maintenance entry will automatically set the vehicle status to <strong>In Shop</strong>.
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Vehicle *</label>
                                <select name="vehicle_id" className="form-select" value={formData.vehicle_id} onChange={handleChange} required>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.license_plate} – {v.name} ({v.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Service Type *</label>
                                <select name="service_type" className="form-select" value={formData.service_type} onChange={handleChange} required>
                                    <option value="">Select service...</option>
                                    {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost (₹) *</label>
                                <input type="number" name="cost" className="form-input" value={formData.cost} onChange={handleChange} placeholder="e.g., 5000" min="0" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Service Date *</label>
                                <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Description</label>
                                <input type="text" name="description" className="form-input" value={formData.description} onChange={handleChange} placeholder="Additional details about the service..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Logging…' : 'Log Service'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <Wrench size={48} />
                        <p>No maintenance logs found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Log ID</th>
                                <th>Vehicle</th>
                                <th>Service Type</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Cost</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>#{log.id}</td>
                                    <td>{vehicleMap[log.vehicle_id]?.license_plate || `#${log.vehicle_id}`}</td>
                                    <td>{log.service_type}</td>
                                    <td>{log.description || '—'}</td>
                                    <td>{log.date}</td>
                                    <td style={{ fontWeight: 600 }}>₹{log.cost?.toLocaleString() || '0'}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'var(--primary-green)' }}
                                            onClick={() => handleCompleteService(log.id)}
                                            disabled={completingLog === log.id}
                                            title="Mark service complete and release vehicle to Available"
                                        >
                                            <CheckCircle size={12} />
                                            {completingLog === log.id ? '...' : 'Complete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Maintenance
