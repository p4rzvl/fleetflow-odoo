import { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, RefreshCw } from 'lucide-react'
import { financeApi, vehicleApi, dispatchApi } from '../services/api'

function Finance() {
    const [expenses, setExpenses] = useState([])
    const [fuelLogs, setFuelLogs] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('expenses')
    const [showForm, setShowForm] = useState(false)

    // Expense form
    const [expenseForm, setExpenseForm] = useState({ vehicle_id: '', expense_type: '', cost: '', date: '', trip_id: '' })
    // Fuel form
    const [fuelForm, setFuelForm] = useState({ vehicle_id: '', fuel_type: 'Petrol', quantity_liters: '', total_cost: '', date: '', odometer_reading: '' })

    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [expData, fuelData, vehiclesData, tripsData] = await Promise.all([
                financeApi.getExpenses(),
                financeApi.getFuelLogs(),
                vehicleApi.getAll(),
                dispatchApi.getAllTrips()
            ])
            setExpenses(expData)
            setFuelLogs(fuelData)
            setVehicles(vehiclesData)
            setTrips(tripsData)
        } catch (error) {
            console.error('Failed to fetch finance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const vehicleMap = {}
    vehicles.forEach(v => { vehicleMap[v.id] = v })

    const handleExpenseChange = (e) => {
        const { name, value } = e.target
        setExpenseForm(prev => ({ ...prev, [name]: value }))
        setFormError('')
    }

    const handleFuelChange = (e) => {
        const { name, value } = e.target
        setFuelForm(prev => ({ ...prev, [name]: value }))
        setFormError('')
    }

    const handleExpenseSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        try {
            const payload = {
                vehicle_id: parseInt(expenseForm.vehicle_id),
                expense_type: expenseForm.expense_type,
                cost: parseFloat(expenseForm.cost),
                date: expenseForm.date,
                trip_id: expenseForm.trip_id ? parseInt(expenseForm.trip_id) : undefined
            }
            if (!payload.trip_id) delete payload.trip_id
            await financeApi.createExpense(payload)
            setExpenseForm({ vehicle_id: '', expense_type: '', cost: '', date: '', trip_id: '' })
            setShowForm(false)
            fetchData()
        } catch (err) {
            const detail = err?.response?.data?.detail
            setFormError(typeof detail === 'string' ? detail : 'Failed to log expense.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleFuelSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        try {
            const payload = {
                vehicle_id: parseInt(fuelForm.vehicle_id),
                fuel_type: fuelForm.fuel_type || undefined,
                quantity_liters: parseFloat(fuelForm.quantity_liters),
                total_cost: parseFloat(fuelForm.total_cost),
                date: fuelForm.date,
                odometer_reading: fuelForm.odometer_reading ? parseFloat(fuelForm.odometer_reading) : undefined
            }
            Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
            await financeApi.createFuelLog(payload)
            setFuelForm({ vehicle_id: '', fuel_type: 'Petrol', quantity_liters: '', total_cost: '', date: '', odometer_reading: '' })
            setShowForm(false)
            fetchData()
        } catch (err) {
            const detail = err?.response?.data?.detail
            setFormError(typeof detail === 'string' ? detail : 'Failed to log fuel.')
        } finally {
            setSubmitting(false)
        }
    }

    const tabButtonStyle = (tab) => ({
        background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem',
        fontWeight: activeTab === tab ? 600 : 500,
        color: activeTab === tab ? 'var(--primary-blue)' : 'var(--gray-500)',
        borderBottom: activeTab === tab ? '2px solid var(--primary-blue)' : '2px solid transparent',
        cursor: 'pointer'
    })

    const filteredExpenses = expenses.filter(exp =>
        exp.expense_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(exp.vehicle_id).includes(searchTerm)
    )

    const filteredFuelLogs = fuelLogs.filter(log =>
        String(log.vehicle_id).includes(searchTerm) ||
        log.fuel_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const expenseTypes = ['Toll', 'Parking', 'Insurance', 'Registration', 'Repairs', 'Cleaning', 'Other']
    const fuelTypes = ['Petrol', 'Diesel', 'Electric']

    return (
        <div>
            <div className="page-header">
                <h2 className="page-title">Financial Logs</h2>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                <button style={tabButtonStyle('expenses')} onClick={() => { setActiveTab('expenses'); setShowForm(false) }}>General Expenses</button>
                <button style={tabButtonStyle('fuel')} onClick={() => { setActiveTab('fuel'); setShowForm(false) }}>Fuel Logs</button>
            </div>

            <div className="toolbar">
                <div className="search-container">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder={`Search ${activeTab === 'expenses' ? 'expenses' : 'fuel logs'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="toolbar-actions">
                    <button className="btn btn-secondary" onClick={fetchData}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-primary" onClick={() => { setShowForm(prev => !prev); setFormError('') }}>
                        <Plus size={16} />
                        {showForm ? 'Close Form' : `New ${activeTab === 'expenses' ? 'Expense' : 'Fuel Log'}`}
                    </button>
                </div>
            </div>

            {showForm && activeTab === 'expenses' && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Log Expense</h3>
                    {formError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>{formError}</div>}
                    <form onSubmit={handleExpenseSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Vehicle *</label>
                                <select name="vehicle_id" className="form-select" value={expenseForm.vehicle_id} onChange={handleExpenseChange} required>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} – {v.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Expense Type *</label>
                                <select name="expense_type" className="form-select" value={expenseForm.expense_type} onChange={handleExpenseChange} required>
                                    <option value="">Select type...</option>
                                    {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (₹) *</label>
                                <input type="number" name="cost" className="form-input" value={expenseForm.cost} onChange={handleExpenseChange} placeholder="e.g., 500" min="0" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input type="date" name="date" className="form-input" value={expenseForm.date} onChange={handleExpenseChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Linked Trip (optional)</label>
                                <select name="trip_id" className="form-select" value={expenseForm.trip_id} onChange={handleExpenseChange}>
                                    <option value="">None</option>
                                    {trips.map(t => <option key={t.id} value={t.id}>#{t.id} – {t.start_location || 'N/A'} → {t.end_location || 'N/A'}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Logging…' : 'Log Expense'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {showForm && activeTab === 'fuel' && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Log Fuel Fill-Up</h3>
                    {formError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>{formError}</div>}
                    <form onSubmit={handleFuelSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Vehicle *</label>
                                <select name="vehicle_id" className="form-select" value={fuelForm.vehicle_id} onChange={handleFuelChange} required>
                                    <option value="">Select vehicle...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} – {v.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fuel Type</label>
                                <select name="fuel_type" className="form-select" value={fuelForm.fuel_type} onChange={handleFuelChange}>
                                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantity (Liters) *</label>
                                <input type="number" name="quantity_liters" className="form-input" value={fuelForm.quantity_liters} onChange={handleFuelChange} placeholder="e.g., 50" min="0" step="0.1" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total Cost (₹) *</label>
                                <input type="number" name="total_cost" className="form-input" value={fuelForm.total_cost} onChange={handleFuelChange} placeholder="e.g., 5000" min="0" step="0.01" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input type="date" name="date" className="form-input" value={fuelForm.date} onChange={handleFuelChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Odometer Reading (km)</label>
                                <input type="number" name="odometer_reading" className="form-input" value={fuelForm.odometer_reading} onChange={handleFuelChange} placeholder="e.g., 82500" min="0" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Logging…' : 'Log Fuel'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : activeTab === 'expenses' ? (
                    filteredExpenses.length === 0 ? (
                        <div className="empty-state"><DollarSign size={48} /><p>No expenses found</p></div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle</th>
                                    <th>Expense Type</th>
                                    <th>Date</th>
                                    <th>Trip</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>#{expense.id}</td>
                                        <td>{vehicleMap[expense.vehicle_id]?.license_plate || `#${expense.vehicle_id}`}</td>
                                        <td>{expense.expense_type}</td>
                                        <td>{expense.date}</td>
                                        <td>{expense.trip_id ? `#${expense.trip_id}` : '—'}</td>
                                        <td style={{ fontWeight: 600 }}>₹{expense.cost?.toLocaleString() || '0'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    filteredFuelLogs.length === 0 ? (
                        <div className="empty-state"><DollarSign size={48} /><p>No fuel logs found</p></div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle</th>
                                    <th>Fuel Type</th>
                                    <th>Date</th>
                                    <th>Quantity (L)</th>
                                    <th>Odometer</th>
                                    <th>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFuelLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>#{log.id}</td>
                                        <td>{vehicleMap[log.vehicle_id]?.license_plate || `#${log.vehicle_id}`}</td>
                                        <td>{log.fuel_type || '—'}</td>
                                        <td>{log.date}</td>
                                        <td>{log.quantity_liters} L</td>
                                        <td>{log.odometer_reading ? `${log.odometer_reading} km` : '—'}</td>
                                        <td style={{ fontWeight: 600 }}>₹{log.total_cost?.toLocaleString() || '0'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    )
}

export default Finance
