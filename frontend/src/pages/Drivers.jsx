import { useState, useEffect } from 'react'
import { Plus, Search, Users, X } from 'lucide-react'
import { driverApi } from '../services/api'

function Drivers() {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        license_number: '',
        license_category: '',
        license_expiry_date: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchDrivers() }, [])

    const fetchDrivers = async () => {
        try {
            setLoading(true)
            const data = await driverApi.getAll()
            setDrivers(data)
        } catch (error) {
            console.error('Failed to fetch drivers:', error)
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
            await driverApi.create({
                name: formData.name,
                license_number: formData.license_number,
                license_category: formData.license_category,
                license_expiry_date: formData.license_expiry_date
            })
            setFormData({ name: '', license_number: '', license_category: '', license_expiry_date: '' })
            setShowForm(false)
            fetchDrivers()
        } catch (err) {
            const detail = err?.response?.data?.detail
            setError(typeof detail === 'string' ? detail : 'Failed to create driver.')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusClass = (status) => {
        const statusMap = {
            'On Duty': 'status-active',
            'Off Duty': 'status-idle',
            'Suspended': 'status-retired'
        }
        return statusMap[status] || 'status-maintenance'
    }

    const filteredDrivers = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.license_category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Driver Management</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-primary" onClick={() => setShowForm(prev => !prev)}>
                        <Plus size={16} />
                        {showForm ? 'Close Form' : 'New Driver'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Register New Driver</h3>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g., Rajesh Kumar" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number *</label>
                                <input type="text" name="license_number" className="form-input" value={formData.license_number} onChange={handleChange} placeholder="e.g., MH01 20210012345" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Category *</label>
                                <select name="license_category" className="form-select" value={formData.license_category} onChange={handleChange} required>
                                    <option value="">Select...</option>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Bike">Bike</option>
                                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Expiry Date *</label>
                                <input type="date" name="license_expiry_date" className="form-input" value={formData.license_expiry_date} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Registering…' : 'Register Driver'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="empty-state">
                        <Users size={48} />
                        <p>No drivers found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>License Number</th>
                                <th>Category</th>
                                <th>Expiry</th>
                                <th>Perf. Score</th>
                                <th>Completion %</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td>#{driver.id}</td>
                                    <td style={{ fontWeight: 500 }}>{driver.name}</td>
                                    <td>{driver.license_number}</td>
                                    <td>{driver.license_category || '-'}</td>
                                    <td>{driver.license_expiry_date}</td>
                                    <td>{driver.performance_score?.toFixed(1) ?? '-'}</td>
                                    <td>{driver.trip_completion_rate?.toFixed(1) ?? '-'}%</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(driver.status)}`}>
                                            {driver.status}
                                        </span>
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

export default Drivers
