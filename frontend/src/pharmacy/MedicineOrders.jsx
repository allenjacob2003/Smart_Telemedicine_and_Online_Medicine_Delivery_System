import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const normalizeOrder = (item) => {
  const patientName = item.patient_name || item.patientName || 'Unknown'
  const medicineName = item.medicine_name || item.medicineName || item.medicine?.name || '—'

  return {
    id: item.id,
    patientName,
    medicineName,
    quantity: item.quantity || 0,
    orderDate: item.order_date || item.created_at || '—',
    paymentStatus: item.payment_status || 'Pending',
    deliveryStatus: item.delivery_status || 'Pending',
    totalPrice: Number(item.total_price) || 0,
  }
}

const MedicineOrders = () => {
  const [orders, setOrders] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const response = await api.get('pharmacy/orders/', {
          params: {
            date: dateFilter,
            patient: patientFilter,
            delivery_status: statusFilter,
            payment_status: paymentFilter,
          },
        })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setOrders(data.map(normalizeOrder))
        setError('')
      } catch (err) {
        setError('Unable to load orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [dateFilter, patientFilter, statusFilter, paymentFilter])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesDate = dateFilter ? order.orderDate.includes(dateFilter) : true
      const matchesPatient = patientFilter
        ? order.patientName.toLowerCase().includes(patientFilter.toLowerCase())
        : true
      const matchesStatus = statusFilter ? order.deliveryStatus === statusFilter : true
      const matchesPayment = paymentFilter ? order.paymentStatus === paymentFilter : true
      return matchesDate && matchesPatient && matchesStatus && matchesPayment
    })
  }, [orders, dateFilter, patientFilter, statusFilter, paymentFilter])

  const getDeliveryStatusClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-')
    if (s === 'delivered') return 'delivered'
    if (s === 'pending') return 'pending'
    if (s === 'packed') return 'packed'
    if (s === 'out-for-delivery') return 'out-for-delivery'
    return 'pending'
  }

  const getPaymentStatusClass = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'paid') return 'paid'
    return 'pending'
  }

  // Stats
  const totalOrders = filteredOrders.length
  const pendingCount = filteredOrders.filter(o => o.deliveryStatus === 'Pending').length
  const deliveredCount = filteredOrders.filter(o => o.deliveryStatus === 'Delivered').length
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

  const clearFilters = () => {
    setDateFilter('')
    setPatientFilter('')
    setStatusFilter('')
    setPaymentFilter('')
  }

  const hasFilters = dateFilter || patientFilter || statusFilter || paymentFilter

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>📋 Medicine Orders</h2>
          <p className="pharmacy-muted">Track and manage all patient medicine orders.</p>
        </div>
        <Link to="/pharmacy/update-order" className="pharmacy-btn pharmacy-btn-primary">
          📝 Update Order Status
        </Link>
      </section>

      {/* Stats Cards */}
      <section className="pharmacy-grid">
        <div className="pharmacy-stat-card primary">
          <div className="pharmacy-stat-icon primary">📦</div>
          <div className="pharmacy-stat-label">Total Orders</div>
          <div className="pharmacy-stat-value">{totalOrders}</div>
        </div>

        <div className="pharmacy-stat-card warning">
          <div className="pharmacy-stat-icon warning">⏳</div>
          <div className="pharmacy-stat-label">Pending</div>
          <div className="pharmacy-stat-value">{pendingCount}</div>
        </div>

        <div className="pharmacy-stat-card info">
          <div className="pharmacy-stat-icon info">✅</div>
          <div className="pharmacy-stat-label">Delivered</div>
          <div className="pharmacy-stat-value">{deliveredCount}</div>
        </div>

        <div className="pharmacy-stat-card accent">
          <div className="pharmacy-stat-icon accent">💰</div>
          <div className="pharmacy-stat-label">Total Value</div>
          <div className="pharmacy-stat-value">₹{totalValue.toLocaleString()}</div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pharmacy-card">
        <div className="pharmacy-card-row" style={{ marginBottom: '16px' }}>
          <h3 className="pharmacy-card-title">🔍 Filter Orders</h3>
          {hasFilters && (
            <button className="pharmacy-btn pharmacy-btn-outline pharmacy-btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="pharmacy-filter-row">
          <label className="pharmacy-filter">
            <span>📅 Order Date</span>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </label>
          
          <label className="pharmacy-filter">
            <span>👤 Patient Name</span>
            <input
              type="text"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              placeholder="Search patient..."
            />
          </label>
          
          <label className="pharmacy-filter">
            <span>🚚 Delivery Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </label>

          <label className="pharmacy-filter">
            <span>💳 Payment Status</span>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </label>
        </div>
      </section>

      {/* Orders Table */}
      <section className="pharmacy-card">
        <div className="pharmacy-card-row" style={{ marginBottom: '16px' }}>
          <h3 className="pharmacy-card-title">Orders List</h3>
          <span className="pharmacy-muted">{filteredOrders.length} orders found</span>
        </div>

        {loading ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading orders...
          </div>
        ) : error ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>❌</div>
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📭</div>
            {hasFilters ? 'No orders match your filters.' : 'No orders found.'}
          </div>
        ) : (
          <div className="pharmacy-table-wrapper">
            <table className="pharmacy-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient Name</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Order Date</th>
                  <th>Payment</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="pharmacy-order-id">#{order.id}</span>
                    </td>
                    <td>
                      <div className="pharmacy-patient-cell">
                        <div className="pharmacy-patient-avatar">
                          {order.patientName[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>{order.patientName}</span>
                      </div>
                    </td>
                    <td><strong>{order.medicineName}</strong></td>
                    <td>{order.quantity}</td>
                    <td>₹{order.totalPrice?.toLocaleString() || 0}</td>
                    <td>{order.orderDate}</td>
                    <td>
                      <span className={`pharmacy-status ${getPaymentStatusClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`pharmacy-status ${getDeliveryStatusClass(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PharmacyLayout>
  )
}

export default MedicineOrders
