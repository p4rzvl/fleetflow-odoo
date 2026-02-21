import { useState, useEffect } from 'react'

function VehicleModal({ vehicle, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    license_plate: '',
    make: '',
    model: '',
    year: '',
    type: 'Truck',
    fuel_type: 'Petrol',
    max_capacity: '',
    purchase_price: '',
    current_value: ''
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        license_plate: vehicle.license_plate || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        type: vehicle.type || 'Truck',
        fuel_type: vehicle.fuel_type || 'Petrol',
        max_capacity: vehicle.max_capacity || '',
        purchase_price: vehicle.purchase_price || '',
        current_value: vehicle.current_value || ''
      })
    }
  }, [vehicle])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Build clean payload matching VehicleCreate schema
    const data = {
      name: formData.name || formData.model || formData.license_plate || 'Vehicle',
      license_plate: formData.license_plate,
      make: formData.make || undefined,
      model: formData.model || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      type: formData.type,
      fuel_type: formData.fuel_type,
      max_capacity: formData.max_capacity ? parseFloat(formData.max_capacity) : 0,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
      current_value: formData.current_value ? parseFloat(formData.current_value) : 0
    }
    // Remove undefined keys to keep payload clean
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k])
    onSave(data)
  }

  const vehicleTypes = ['Truck', 'Van', 'Bike']
  const fuelTypes = ['Petrol', 'Diesel', 'Electric']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {vehicle ? 'Vehicle Details' : 'New Vehicle Registration'}
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">License Plate *</label>
              <input
                type="text"
                name="license_plate"
                className="form-input"
                value={formData.license_plate}
                onChange={handleChange}
                placeholder="e.g., MH 12 AB 3456"
                required
                disabled={!!vehicle}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Name / Description *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Tata Prima Truck"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Make</label>
                <input
                  type="text"
                  name="make"
                  className="form-input"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Tata"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Prima 3525"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  name="year"
                  className="form-input"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  min="1990"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Payload (tons) *</label>
                <input
                  type="number"
                  name="max_capacity"
                  className="form-input"
                  value={formData.max_capacity}
                  onChange={handleChange}
                  placeholder="e.g., 5.0"
                  step="0.1"
                  min="0"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Type *</label>
                <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                  {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select name="fuel_type" className="form-select" value={formData.fuel_type} onChange={handleChange}>
                  {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Purchase Price (₹)</label>
                <input
                  type="number"
                  name="purchase_price"
                  className="form-input"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  placeholder="e.g., 2500000"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Value (₹)</label>
                <input
                  type="number"
                  name="current_value"
                  className="form-input"
                  value={formData.current_value}
                  onChange={handleChange}
                  placeholder="e.g., 1800000"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {!vehicle && (
              <button type="submit" className="btn btn-primary">Register Vehicle</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default VehicleModal
