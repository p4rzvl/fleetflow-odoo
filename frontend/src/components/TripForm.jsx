import { useState } from 'react'
import { Send } from 'lucide-react'

function TripForm({ vehicles, drivers, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    start_location: '',
    end_location: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id))
    const cargoWeight = parseFloat(formData.cargo_weight) || 0

    if (selectedVehicle && cargoWeight > selectedVehicle.max_capacity) {
      setError(
        `Cargo weight (${cargoWeight} tons) exceeds vehicle max capacity (${selectedVehicle.max_capacity} tons).`
      )
      return
    }

    setSubmitting(true)
    try {
      const data = {
        vehicle_id: parseInt(formData.vehicle_id),
        driver_id: parseInt(formData.driver_id),
        cargo_weight: cargoWeight,
        start_location: formData.start_location || undefined,
        end_location: formData.end_location || undefined
      }
      Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
      await onSubmit(data)
      setFormData({ vehicle_id: '', driver_id: '', cargo_weight: '', start_location: '', end_location: '' })
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to create trip. Please try again.'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const availableVehicles = vehicles.filter(v => v.status === 'Available')
  const availableDrivers = drivers.filter(d => d.status === 'On Duty')

  return (
    <div className="trip-form-container" style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 className="trip-form-title" style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>New Trip</h3>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Vehicle (Available only)</label>
            <select name="vehicle_id" className="form-select" value={formData.vehicle_id} onChange={handleChange} required>
              <option value="">Choose a vehicle...</option>
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.license_plate} – {v.type} ({v.max_capacity} tons)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Driver (On Duty only)</label>
            <select name="driver_id" className="form-select" value={formData.driver_id} onChange={handleChange} required>
              <option value="">Choose a driver...</option>
              {availableDrivers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} – {d.license_number}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cargo Weight (tons) *</label>
            <input
              type="number"
              name="cargo_weight"
              className="form-input"
              value={formData.cargo_weight}
              onChange={handleChange}
              placeholder="e.g., 3.5"
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Origin</label>
            <input
              type="text"
              name="start_location"
              className="form-input"
              value={formData.start_location}
              onChange={handleChange}
              placeholder="e.g., Mumbai"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination</label>
            <input
              type="text"
              name="end_location"
              className="form-input"
              value={formData.end_location}
              onChange={handleChange}
              placeholder="e.g., Pune"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Send size={16} />
            {submitting ? 'Creating…' : 'Create Trip (Draft)'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default TripForm
