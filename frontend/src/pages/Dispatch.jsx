import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Send, CheckCircle } from 'lucide-react'
import { dispatchApi, vehicleApi, driverApi } from '../services/api'
import TripForm from '../components/TripForm'

function Dispatch() {
    const [trips, setTrips] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showTripForm, setShowTripForm] = useState(false)
    const [actionLoading, setActionLoading] = useState(null)

    // Complete trip modal state
    const [completingTrip, setCompletingTrip] = useState(null)
    const [finalOdometer, setFinalOdometer] = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            setLoading(true)
            const [tripsData, vehiclesData, driversData] = await Promise.all([
                dispatchApi.getAllTrips(),
                vehicleApi.getAll(),
                driverApi.getAll()
            ])
            setTrips(tripsData)
            setVehicles(vehiclesData)
            setDrivers(driversData)
        } catch (error) {
            console.error('Failed to fetch dispatch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTrip = async (tripData) => {
        await dispatchApi.createTrip(tripData)
        setShowTripForm(false)
        fetchAll()
    }

    const handleDispatch = async (tripId) => {
        setActionLoading(tripId)
        try {
            await dispatchApi.dispatchTrip(tripId)
            fetchAll()
        } catch (error) {
            const detail = error?.response?.data?.detail
            alert(typeof detail === 'string' ? detail : 'Cannot dispatch trip.')
        } finally {
            setActionLoading(null)
        }
    }

    const handleCompleteOpen = (trip) => {
        setCompletingTrip(trip)
        setFinalOdometer('')
    }

    const handleCompleteSubmit = async () => {
        if (!finalOdometer) { alert('Please enter final odometer reading.'); return }
        setActionLoading(completingTrip.id)
        try {
            await dispatchApi.completeTrip(completingTrip.id, parseFloat(finalOdometer))
            setCompletingTrip(null)
            fetchAll()
        } catch (error) {
            const detail = error?.response?.data?.detail
            alert(typeof detail === 'string' ? detail : 'Cannot complete trip.')
        } finally {
            setActionLoading(null)
        }
    }

    const formatStatus = (status) => status || 'Unknown'

    const getStatusClass = (status) => {
        const statusMap = {
            'Draft': 'status-maintenance',
            'Dispatched': 'status-active',
            'Completed': 'status-idle',
            'Cancelled': 'status-retired'
        }
        return statusMap[status] || 'status-idle'
    }

    // Build lookup maps for display
    const vehicleMap = {}
    vehicles.forEach(v => { vehicleMap[v.id] = v })
    const driverMap = {}
    drivers.forEach(d => { driverMap[d.id] = d })

    const filteredTrips = trips.filter(trip =>
        trip.start_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.end_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(trip.id).includes(searchTerm)
    )

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Trip Dispatch</h2>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by location or Trip ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-primary" onClick={() => setShowTripForm(prev => !prev)}>
                        <Plus size={16} />
                        {showTripForm ? 'Close Form' : 'New Trip'}
                    </button>
                </div>
            </div>

            {showTripForm && (
                <TripForm
                    vehicles={vehicles}
                    drivers={drivers}
                    onSubmit={handleCreateTrip}
                    onCancel={() => setShowTripForm(false)}
                />
            )}

            <div className="table-container">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : filteredTrips.length === 0 ? (
                    <div className="empty-state">
                        <MapPin size={48} />
                        <p>No trips found</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Trip ID</th>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Cargo (t)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id}>
                                    <td>#{trip.id}</td>
                                    <td>{vehicleMap[trip.vehicle_id]?.license_plate || `#${trip.vehicle_id}`}</td>
                                    <td>{driverMap[trip.driver_id]?.name || `#${trip.driver_id}`}</td>
                                    <td>{trip.start_location || '—'}</td>
                                    <td>{trip.end_location || '—'}</td>
                                    <td>{trip.cargo_weight}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(trip.status)}`}>
                                            {formatStatus(trip.status)}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        {trip.status === 'Draft' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                                                onClick={() => handleDispatch(trip.id)}
                                                disabled={actionLoading === trip.id}
                                            >
                                                <Send size={12} />
                                                {actionLoading === trip.id ? '...' : 'Dispatch'}
                                            </button>
                                        )}
                                        {trip.status === 'Dispatched' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'var(--primary-green)' }}
                                                onClick={() => handleCompleteOpen(trip)}
                                                disabled={actionLoading === trip.id}
                                            >
                                                <CheckCircle size={12} />
                                                {actionLoading === trip.id ? '...' : 'Complete'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Complete Trip Modal */}
            {completingTrip && (
                <div className="modal-overlay" onClick={() => setCompletingTrip(null)}>
                    <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Complete Trip #{completingTrip.id}</h3>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Final Odometer Reading (km)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={finalOdometer}
                                    onChange={e => setFinalOdometer(e.target.value)}
                                    placeholder="e.g., 85000"
                                    min="0"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setCompletingTrip(null)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCompleteSubmit}
                                disabled={actionLoading === completingTrip.id}
                            >
                                {actionLoading === completingTrip.id ? 'Completing…' : 'Mark Complete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dispatch
