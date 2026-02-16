import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const DashboardHome = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSummary = async () => {
      try {
        if (mounted) setLoading(true)
        const response = await api.get('pharmacy/dashboard-summary/')
        if (mounted) setSummary(response.data)
      } catch (err) {
        if (mounted) setSummary(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSummary()
    return () => { mounted = false }
  }, [])

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-')
    if (s === 'delivered') return 'delivered'
    if (s === 'pending') return 'pending'
    if (s === 'packed') return 'packed'
    if (s === 'out-for-delivery') return 'out-for-delivery'
    return 'pending'
  }

  const formatINR = (value) => Number(value ?? 0).toLocaleString('en-IN')

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header" style={{ marginTop: 0 }}>
        <div>
          <h2>📊 Dashboard Overview</h2>
          <p className="pharmacy-muted">A quick snapshot of pharmacy activity and performance.</p>
        </div>
      </section>

      {loading ? (
        <div className="pharmacy-card">
          <div
            className="pharmacy-loading"
            style={{ padding: '60px 40px' }}
            role="status"
            aria-live="polite"
          >
            <div className="pharmacy-loading-spinner"></div>
            <span className="pharmacy-loading-text">Loading dashboard summary...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <section className="pharmacy-grid">
            <div className="pharmacy-stat-card primary">
              <div className="pharmacy-stat-icon primary">📦</div>
              <div className="pharmacy-stat-label">Total Orders</div>
              <div className="pharmacy-stat-value">{summary?.total_orders ?? 0}</div>
              <div className="pharmacy-stat-footer">
                <Link to="/pharmacy/orders" className="pharmacy-view-all-btn">
                  View All Orders →
                </Link>
              </div>
            </div>

            <div className="pharmacy-stat-card warning">
              <div className="pharmacy-stat-icon warning">⏳</div>
              <div className="pharmacy-stat-label">Pending Orders</div>
              <div className="pharmacy-stat-value">{summary?.pending_deliveries ?? 0}</div>
              <div className="pharmacy-stat-footer">
                <Link to="/pharmacy/update-order" className="pharmacy-view-all-btn">
                  Update Status →
                </Link>
              </div>
            </div>

            <div className="pharmacy-stat-card info">
              <div className="pharmacy-stat-icon info">✅</div>
              <div className="pharmacy-stat-label">Delivered Orders</div>
              <div className="pharmacy-stat-value">{summary?.delivered_orders ?? 0}</div>
              <div className="pharmacy-stat-footer">
                <Link to="/pharmacy/orders" className="pharmacy-view-all-btn">
                  View Details →
                </Link>
              </div>
            </div>

            <div className="pharmacy-stat-card accent">
              <div className="pharmacy-stat-icon accent">💰</div>
              <div className="pharmacy-stat-label">Total Revenue</div>
              <div className="pharmacy-stat-value">₹{formatINR(summary?.total_revenue)}</div>
              <div className="pharmacy-stat-footer">
                <Link to="/pharmacy/payments" className="pharmacy-view-all-btn">
                  View Payments →
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Orders & Low Stock */}
          <div
            className="pharmacy-grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
          >
            {/* Recent Orders */}
            <section className="pharmacy-card">
              <div className="pharmacy-card-row" style={{ marginBottom: '20px' }}>
                <div>
                  <h3 className="pharmacy-card-title">Recent Orders</h3>
                  <p className="pharmacy-muted" style={{ fontSize: '0.85rem' }}>Latest medicine orders</p>
                </div>
                <Link to="/pharmacy/orders" className="pharmacy-btn pharmacy-btn-secondary pharmacy-btn-sm">
                  View All
                </Link>
              </div>

              {(!summary?.recent_orders || summary.recent_orders.length === 0) ? (
                <div className="pharmacy-empty" style={{ padding: '24px' }}>No recent orders.</div>
              ) : (
                <div className="pharmacy-recent-list">
                  {summary.recent_orders.map((order) => {
                    const statusText = order.delivery_status || 'Pending'
                    return (
                      <div className="pharmacy-recent-item" key={order.id}>
                        <div className="pharmacy-recent-avatar">
                          {(order.patient_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="pharmacy-recent-info">
                          <div className="pharmacy-recent-name">{order.patient_name}</div>
                          <div className="pharmacy-recent-medicine">{order.medicine_name} × {order.quantity}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="pharmacy-recent-price">
                            ₹{formatINR(order.total_price)}
                          </div>
                          <span
                            className={`pharmacy-status ${getStatusClass(statusText)}`}
                            style={{ fontSize: '0.65rem', padding: '4px 8px' }}
                          >
                            {statusText}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Low Stock Alerts */}
            <section className="pharmacy-card">
              <div className="pharmacy-card-row" style={{ marginBottom: '20px' }}>
                <div>
                  <h3 className="pharmacy-card-title">⚠️ Low Stock Alerts</h3>
                  <p className="pharmacy-muted" style={{ fontSize: '0.85rem' }}>Medicines running low</p>
                </div>
                <Link to="/pharmacy/stock" className="pharmacy-btn pharmacy-btn-secondary pharmacy-btn-sm">
                  Manage Stock
                </Link>
              </div>

              {(!summary?.low_stock_medicines || summary.low_stock_medicines.length === 0) ? (
                <div className="pharmacy-empty" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                  All medicines are well stocked!
                </div>
              ) : (
                <div className="pharmacy-table-wrapper">
                  <table className="pharmacy-table">
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.low_stock_medicines.map((med) => (
                        <tr key={med.id}>
                          <td>
                            <strong>{med.name}</strong>
                            {med.category && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{med.category}</div>}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: med.available_quantity <= 5 ? '#dc2626' : '#d97706' }}>
                              {med.available_quantity}
                            </span>
                          </td>
                          <td>
                            <span className={`pharmacy-pill ${med.available_quantity <= 5 ? 'danger' : ''}`}>
                              {med.available_quantity <= 5 ? 'Critical' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Quick Actions */}
          <section className="pharmacy-card">
            <h3 className="pharmacy-card-title" style={{ marginBottom: '20px' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/pharmacy/add-medicine" className="pharmacy-btn pharmacy-btn-primary">
                ➕ Add New Medicine
              </Link>
              <Link to="/pharmacy/update-order" className="pharmacy-btn pharmacy-btn-secondary">
                📝 Update Order Status
              </Link>
              <Link to="/pharmacy/stock" className="pharmacy-btn pharmacy-btn-outline">
                📊 Stock Management
              </Link>
              <Link to="/pharmacy/payments" className="pharmacy-btn pharmacy-btn-outline">
                💳 Payment Reports
              </Link>
            </div>
          </section>
        </>
      )}
    </PharmacyLayout>
  )
}

export default DashboardHome
