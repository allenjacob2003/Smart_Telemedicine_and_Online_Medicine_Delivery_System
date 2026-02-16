import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const UpdateOrderStatus = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = filterStatus ? { delivery_status: filterStatus } : {}
      const response = await api.get('pharmacy/orders/', { params })
      const data = Array.isArray(response.data) ? response.data : response.data?.results || []
      setOrders(data)
    } catch (err) {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [filterStatus])

  const handleStatusChange = (id, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, delivery_status: status } : order))
    )
  }

  const handleUpdate = async (id, status) => {
    try {
      setUpdatingId(id)
      await api.put(`pharmacy/update-order/${id}/`, { delivery_status: status })
      setMessage({ type: 'success', text: `Order #${id} status updated to ${status}!` })
      loadOrders()
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update order status.' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-')
    if (s === 'delivered') return 'delivered'
    if (s === 'pending') return 'pending'
    if (s === 'packed') return 'packed'
    if (s === 'out-for-delivery') return 'out-for-delivery'
    return 'pending'
  }

  const getNextStatus = (current) => {
    const flow = ['Pending', 'Packed', 'Out for Delivery', 'Delivered']
    const idx = flow.indexOf(current)
    return idx < flow.length - 1 ? flow[idx + 1] : null
  }

  // Stats
  const pendingCount = orders.filter(o => (o.delivery_status || 'Pending') === 'Pending').length
  const packedCount = orders.filter(o => o.delivery_status === 'Packed').length
  const outCount = orders.filter(o => o.delivery_status === 'Out for Delivery').length
  const deliveredCount = orders.filter(o => o.delivery_status === 'Delivered').length

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>📝 Update Order Status</h2>
          <p className="pharmacy-muted">Manage delivery progress for all orders.</p>
        </div>
        <Link to="/pharmacy/orders" className="pharmacy-btn pharmacy-btn-secondary">
          📋 View All Orders
        </Link>
      </section>

      {/* Status Overview Cards */}
      <section className="pharmacy-grid">
        <div 
          className={`pharmacy-stat-card warning ${filterStatus === 'Pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Pending' ? '' : 'Pending')}
          style={{ cursor: 'pointer' }}
        >
          <div className="pharmacy-stat-icon warning">⏳</div>
          <div className="pharmacy-stat-label">Pending</div>
          <div className="pharmacy-stat-value">{pendingCount}</div>
        </div>

        <div 
          className={`pharmacy-stat-card info ${filterStatus === 'Packed' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Packed' ? '' : 'Packed')}
          style={{ cursor: 'pointer' }}
        >
          <div className="pharmacy-stat-icon info">📦</div>
          <div className="pharmacy-stat-label">Packed</div>
          <div className="pharmacy-stat-value">{packedCount}</div>
        </div>

        <div 
          className={`pharmacy-stat-card primary ${filterStatus === 'Out for Delivery' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Out for Delivery' ? '' : 'Out for Delivery')}
          style={{ cursor: 'pointer' }}
        >
          <div className="pharmacy-stat-icon primary">🚚</div>
          <div className="pharmacy-stat-label">Out for Delivery</div>
          <div className="pharmacy-stat-value">{outCount}</div>
        </div>

        <div 
          className={`pharmacy-stat-card accent ${filterStatus === 'Delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'Delivered' ? '' : 'Delivered')}
          style={{ cursor: 'pointer' }}
        >
          <div className="pharmacy-stat-icon accent">✅</div>
          <div className="pharmacy-stat-label">Delivered</div>
          <div className="pharmacy-stat-value">{deliveredCount}</div>
        </div>
      </section>

      {/* Message Alert */}
      {message && (
        <div className={`pharmacy-alert ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Filter Info */}
      {filterStatus && (
        <div className="pharmacy-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Showing orders with status: <strong>{filterStatus}</strong></span>
          <button className="pharmacy-btn pharmacy-btn-outline pharmacy-btn-sm" onClick={() => setFilterStatus('')}>
            Clear Filter
          </button>
        </div>
      )}

      {/* Orders Table */}
      <section className="pharmacy-card">
        <div className="pharmacy-card-row" style={{ marginBottom: '16px' }}>
          <h3 className="pharmacy-card-title">Orders to Update</h3>
          <span className="pharmacy-muted">{orders.length} orders</span>
        </div>

        {loading ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
            {filterStatus ? `No ${filterStatus} orders found.` : 'No orders available.'}
          </div>
        ) : (
          <div className="pharmacy-table-wrapper">
            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Current Status</th>
                  <th>Update To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const currentStatus = order.delivery_status || 'Pending'
                  const nextStatus = getNextStatus(currentStatus)
                  const isDelivered = currentStatus === 'Delivered'

                  return (
                    <tr key={order.id} className={isDelivered ? 'completed-row' : ''}>
                      <td>
                        <span className="pharmacy-order-id">#{order.id}</span>
                      </td>
                      <td>
                        <div className="pharmacy-patient-cell">
                          <div className="pharmacy-patient-avatar">
                            {(order.patient_name || order.patientName || 'U')[0]?.toUpperCase()}
                          </div>
                          <span>{order.patient_name || order.patientName}</span>
                        </div>
                      </td>
                      <td><strong>{order.medicine_name || order.medicineName || order.medicine?.name}</strong></td>
                      <td>{order.quantity}</td>
                      <td>₹{order.total_price?.toLocaleString() || 0}</td>
                      <td>
                        <span className={`pharmacy-status ${getStatusClass(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td>
                        {isDelivered ? (
                          <span className="pharmacy-muted">Completed</span>
                        ) : (
                          <select
                            className="pharmacy-status-select"
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Packed">Packed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {isDelivered ? (
                          <span className="pharmacy-pill success">✓ Done</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="pharmacy-btn pharmacy-btn-primary pharmacy-btn-sm"
                              type="button"
                              disabled={updatingId === order.id}
                              onClick={() => handleUpdate(order.id, currentStatus)}
                            >
                              {updatingId === order.id ? '...' : 'Save'}
                            </button>
                            {nextStatus && (
                              <button
                                className="pharmacy-btn pharmacy-btn-secondary pharmacy-btn-sm"
                                type="button"
                                disabled={updatingId === order.id}
                                onClick={() => handleUpdate(order.id, nextStatus)}
                                title={`Quick update to ${nextStatus}`}
                              >
                                → {nextStatus.split(' ')[0]}
                              </button>
                            )}
                          </div>
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

      {/* Delivery Flow Guide */}
      <section className="pharmacy-card">
        <h3 className="pharmacy-card-title" style={{ marginBottom: '16px' }}>📖 Delivery Status Flow</h3>
        <div className="pharmacy-status-flow">
          <div className="pharmacy-flow-step">
            <span className="pharmacy-status pending">Pending</span>
            <span className="pharmacy-flow-arrow">→</span>
          </div>
          <div className="pharmacy-flow-step">
            <span className="pharmacy-status packed">Packed</span>
            <span className="pharmacy-flow-arrow">→</span>
          </div>
          <div className="pharmacy-flow-step">
            <span className="pharmacy-status out-for-delivery">Out for Delivery</span>
            <span className="pharmacy-flow-arrow">→</span>
          </div>
          <div className="pharmacy-flow-step">
            <span className="pharmacy-status delivered">Delivered</span>
          </div>
        </div>
      </section>
    </PharmacyLayout>
  )
}

export default UpdateOrderStatus
