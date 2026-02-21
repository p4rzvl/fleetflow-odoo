import { useState, useEffect } from 'react'
import { Search, Plus, RefreshCw, Truck } from 'lucide-react'
import VehicleModal from '../components/VehicleModal'
import { vehicleApi } from '../services/api'

function VehicleRegistry() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewingVehicle, setViewingVehicle] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchVehicles() }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const data = await vehicleApi.getAll()
      setVehicles(data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = () => {
    setViewingVehicle(null)
    setShowModal(true)
  }

  const handleViewVehicle = (vehicle) => {
    setViewingVehicle(vehicle)
    setShowModal(true)
  }

  const handleSaveVehicle = async (vehicleData) => {
    try {
      await vehicleApi.create(vehicleData)
      setShowModal(false)
      fetchVehicles()
    } catch (error) {
      const detail = error?.response?.data?.detail
      alert(typeof detail === 'string' ? detail : 'Failed to register vehicle.')
      console.error('Failed to save vehicle:', error)
    }
  }

  const handleToggleOutOfService = async (vehicle) => {
    setActionLoading(vehicle.id)
    try {
      await vehicleApi.toggleOutOfService(vehicle.id)
      fetchVehicles()
    } catch (error) {
      const detail = error?.response?.data?.detail
      alert(typeof detail === 'string' ? detail : 'Cannot change status.')
      console.error('Failed to toggle out-of-service:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusClass = (status) => {
    const statusMap = {
      'Available': 'status-active',
      'On Trip': 'status-active',
      'In Shop': 'status-maintenance',
      'Out of Service': 'status-retired'
    }
    return statusMap[status] || 'status-idle'
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Vehicle Registry</h2>
      </div>

      <div className="toolbar">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by plate, name, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <button className="btn btn-secondary" onClick={fetchVehicles}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleAddVehicle}>
            <Plus size={16} />
            New Vehicle
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : filteredVehicles.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} />
            <p>No vehicles found</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddVehicle}>
              <Plus size={16} />
              Add your first vehicle
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>NO</th>
                <th>Plate</th>
                <th>Name</th>
                <th>Type</th>
                <th>Fuel</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle, index) => (
                <tr key={vehicle.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{vehicle.license_plate}</td>
                  <td>{vehicle.name || '-'}</td>
                  <td>{vehicle.type || '-'}</td>
                  <td>{vehicle.fuel_type || '-'}</td>
                  <td>{vehicle.max_capacity ? `${vehicle.max_capacity} t` : '-'}</td>
                  <td>{vehicle.odometer?.toLocaleString() || '0'} km</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                      {vehicle.status || 'Available'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                      onClick={() => handleViewVehicle(vehicle)}
                      title="View details"
                    >
                      View
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                      onClick={() => handleToggleOutOfService(vehicle)}
                      title={vehicle.status === 'Out of Service' ? 'Reactivate vehicle' : 'Mark Out of Service'}
                      disabled={actionLoading === vehicle.id || vehicle.status === 'On Trip' || vehicle.status === 'In Shop'}
                    >
                      {actionLoading === vehicle.id
                        ? '...'
                        : vehicle.status === 'Out of Service'
                          ? 'Reactivate'
                          : 'Out of Service'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <VehicleModal
          vehicle={viewingVehicle}
          onSave={handleSaveVehicle}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default VehicleRegistry
