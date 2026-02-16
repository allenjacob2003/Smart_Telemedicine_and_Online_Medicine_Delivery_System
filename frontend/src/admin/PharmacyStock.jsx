import { useEffect, useState } from 'react'
import api from '../api/axios'
import './AdminShared.css'

const PharmacyStock = () => {
    const [medicines, setMedicines] = useState([])
    const [filteredMedicines, setFilteredMedicines] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    const loadStock = async () => {
        try {
            setLoading(true)
            // Per task 1, we know the endpoint is pharmacy/stock/
            const res = await api.get('pharmacy/stock/')
            setMedicines(res.data || [])
            setFilteredMedicines(res.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStock()
    }, [])

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredMedicines(medicines)
            return
        }
        const query = searchQuery.toLowerCase()
        setFilteredMedicines(
            medicines.filter((m) => (m.name || '').toLowerCase().includes(query))
        )
    }, [searchQuery, medicines])

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="admin-title">Pharmacy Stock</h2>
                    <p className="admin-subtitle">Monitor medicine inventory</p>
                </div>
                <div className="admin-search-container">
                    <span className="admin-search-icon" aria-hidden="true">🔍</span>
                    <input
                        type="text"
                        className="admin-search-input"
                        placeholder="Search medicine..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="admin-search-btn">Search</button>
                </div>
            </div>

            {loading ? (
                <div className="empty-state">Loading stock...</div>
            ) : filteredMedicines.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? `No medicines found matching "${searchQuery}"` : 'Inventory is empty.'}
                </div>
            ) : (
                <div className="admin-grid">
                    {filteredMedicines.map((med) => {
                        const quantity = med.available_quantity ?? med.stock_quantity ?? 0
                        const isLow = quantity < 10
                        return (
                            <article className="admin-card" key={med.id}>
                                <div className="admin-card-header">
                                    <div>
                                        <h3 className="admin-card-title">{med.name}</h3>
                                        <div className="admin-card-subtitle">Batch: {med.batch_number || 'N/A'}</div>
                                    </div>
                                    <span className={`status-badge ${isLow ? 'status-cancelled' : 'status-active'}`}>
                                        {isLow ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </div>
                                <div className="admin-card-body">
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Available Quantity</span>
                                        <span className="admin-card-value" style={{ color: isLow ? '#dc3545' : 'inherit', fontWeight: 'bold' }}>
                                            {quantity}
                                        </span>
                                    </div>
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Price</span>
                                        <span className="admin-card-value">₹{med.price}</span>
                                    </div>
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Expiry</span>
                                        <span className="admin-card-value">{med.expiry_date || '—'}</span>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default PharmacyStock
