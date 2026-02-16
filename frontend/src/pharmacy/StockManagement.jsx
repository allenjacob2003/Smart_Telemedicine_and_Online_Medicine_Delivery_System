import { useEffect, useState } from 'react'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const StockManagement = () => {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState(0)

  const loadStock = async () => {
    try {
      setLoading(true)
      let url = 'pharmacy/stock/'
      const params = []
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`)
      if (categoryFilter) params.push(`category=${encodeURIComponent(categoryFilter)}`)
      if (showLowStock) params.push('low_stock=true')
      if (params.length > 0) url += '?' + params.join('&')
      
      const response = await api.get(url)
      const data = Array.isArray(response.data) ? response.data : response.data?.results || []
      setStocks(data)
    } catch (err) {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStock()
  }, [searchTerm, categoryFilter, showLowStock])

  const handleStartEdit = (stock) => {
    setEditingId(stock.id)
    setEditQuantity(stock.available_quantity)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditQuantity(0)
  }

  const handleUpdate = async (id) => {
    try {
      await api.put(`pharmacy/update-stock/${id}/`, { available_quantity: editQuantity })
      setMessage({ type: 'success', text: 'Stock updated successfully!' })
      setEditingId(null)
      loadStock()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update stock.' })
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Get unique categories for filter dropdown
  const categories = [...new Set(stocks.filter(s => s.category).map(s => s.category))]

  // Stats calculations
  const totalMedicines = stocks.length
  const lowStockCount = stocks.filter(s => s.available_quantity <= (s.low_stock_threshold || 10)).length
  const outOfStockCount = stocks.filter(s => s.available_quantity === 0).length

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>📦 Stock Management</h2>
          <p className="pharmacy-muted">Monitor and update medicine inventory levels.</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="pharmacy-grid">
        <div className="pharmacy-stat-card primary">
          <div className="pharmacy-stat-icon primary">💊</div>
          <div className="pharmacy-stat-label">Total Medicines</div>
          <div className="pharmacy-stat-value">{totalMedicines}</div>
        </div>

        <div className="pharmacy-stat-card warning">
          <div className="pharmacy-stat-icon warning">⚠️</div>
          <div className="pharmacy-stat-label">Low Stock</div>
          <div className="pharmacy-stat-value">{lowStockCount}</div>
        </div>

        <div className="pharmacy-stat-card danger">
          <div className="pharmacy-stat-icon danger">❌</div>
          <div className="pharmacy-stat-label">Out of Stock</div>
          <div className="pharmacy-stat-value">{outOfStockCount}</div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="pharmacy-card">
        <div className="pharmacy-search-filters">
          <div className="pharmacy-search-box">
            <span className="pharmacy-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search medicines by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="pharmacy-search-clear" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>

          <div className="pharmacy-filter-group">
            <label className="pharmacy-filter">
              <span>Category</span>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label className="pharmacy-checkbox-filter">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              <span>Show Low Stock Only</span>
            </label>
          </div>
        </div>
      </section>

      {/* Message Alert */}
      {message && (
        <div className={`pharmacy-alert ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Stock Table */}
      <section className="pharmacy-card">
        <div className="pharmacy-card-row" style={{ marginBottom: '16px' }}>
          <h3 className="pharmacy-card-title">Medicine Inventory</h3>
          <span className="pharmacy-muted">{stocks.length} items</span>
        </div>

        {loading ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading stock data...
          </div>
        ) : stocks.length === 0 ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
            {searchTerm || categoryFilter || showLowStock 
              ? 'No medicines match your filters.' 
              : 'No medicines available in inventory.'}
          </div>
        ) : (
          <div className="pharmacy-table-wrapper">
            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available Qty</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const isLow = stock.available_quantity <= (stock.low_stock_threshold || 10)
                  const isOut = stock.available_quantity === 0
                  const isCritical = stock.available_quantity > 0 && stock.available_quantity <= 5

                  return (
                    <tr key={stock.id} className={isOut ? 'out-of-stock-row' : isLow ? 'low-stock-row' : ''}>
                      <td>
                        <strong>{stock.name}</strong>
                      </td>
                      <td>
                        {stock.category ? (
                          <span className="pharmacy-category-badge">{stock.category}</span>
                        ) : (
                          <span className="pharmacy-muted">—</span>
                        )}
                      </td>
                      <td>₹{Number(stock.price || 0).toFixed(2)}</td>
                      <td>
                        {editingId === stock.id ? (
                          <input
                            type="number"
                            className="pharmacy-qty-input"
                            value={editQuantity}
                            min="0"
                            onChange={(e) => setEditQuantity(Number(e.target.value))}
                            autoFocus
                          />
                        ) : (
                          <span className={`pharmacy-qty ${isOut ? 'danger' : isLow ? 'warning' : ''}`}>
                            {stock.available_quantity}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="pharmacy-muted">{stock.low_stock_threshold || 10}</span>
                      </td>
                      <td>
                        {isOut ? (
                          <span className="pharmacy-pill danger">Out of Stock</span>
                        ) : isCritical ? (
                          <span className="pharmacy-pill danger">Critical</span>
                        ) : isLow ? (
                          <span className="pharmacy-pill warning">Low Stock</span>
                        ) : (
                          <span className="pharmacy-pill success">In Stock</span>
                        )}
                      </td>
                      <td>
                        {editingId === stock.id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="pharmacy-btn pharmacy-btn-primary pharmacy-btn-sm"
                              onClick={() => handleUpdate(stock.id)}
                            >
                              Save
                            </button>
                            <button
                              className="pharmacy-btn pharmacy-btn-outline pharmacy-btn-sm"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="pharmacy-btn pharmacy-btn-secondary pharmacy-btn-sm"
                            onClick={() => handleStartEdit(stock)}
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PharmacyLayout>
  )
}

export default StockManagement
