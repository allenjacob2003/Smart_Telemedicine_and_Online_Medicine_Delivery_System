import { useEffect, useState } from 'react'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const Payments = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true)
        const response = await api.get('pharmacy/payments-summary/')
        setSummary(response.data)
      } catch (err) {
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  // Fill in missing dates in revenue series for last 7 days
  const getCompleteRevenueSeries = () => {
    const revenueSeries = summary?.revenue_series || []
    const result = []
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Find if this date has data
      const existingData = revenueSeries.find(item => item.date === dateStr)
      
      result.push({
        date: dateStr,
        amount: existingData ? Number(existingData.amount) : 0
      })
    }
    
    return result
  }

  const revenueSeries = getCompleteRevenueSeries()
  const topMedicines = summary?.top_medicines || []
  const deliveryBreakdown = summary?.delivery_breakdown || {}

  // Calculate max for scaling bars
  const maxRevenue = Math.max(...revenueSeries.map(p => p.amount || 0), 100)
  const maxMedicineSales = Math.max(...topMedicines.map(m => m.total_quantity || 0), 1)

  // Delivery status colors for pie chart
  const deliveryColors = {
    'Delivered': '#10b981',
    'Out for Delivery': '#3b82f6',
    'Packed': '#8b5cf6',
    'Pending': '#f59e0b'
  }

  // Calculate total for pie chart
  const deliveryTotal = Object.values(deliveryBreakdown).reduce((sum, val) => sum + val, 0) || 1

  return (
    <PharmacyLayout>
      {/* Header */}
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>💳 Payment Analytics</h2>
          <p className="pharmacy-muted">Track revenue, sales performance, and payment insights.</p>
        </div>
      </section>

      {loading ? (
        <div className="pharmacy-card">
          <div className="pharmacy-empty" style={{ padding: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            Loading payment analytics...
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <section className="pharmacy-grid">
            <div className="pharmacy-stat-card accent">
              <div className="pharmacy-stat-icon accent">💰</div>
              <div className="pharmacy-stat-label">Total Revenue</div>
              <div className="pharmacy-stat-value">₹{(summary?.total_revenue ?? 0).toLocaleString()}</div>
            </div>

            <div className="pharmacy-stat-card primary">
              <div className="pharmacy-stat-icon primary">📦</div>
              <div className="pharmacy-stat-label">Total Orders</div>
              <div className="pharmacy-stat-value">{summary?.total_orders ?? 0}</div>
            </div>

            <div className="pharmacy-stat-card info">
              <div className="pharmacy-stat-icon info">✅</div>
              <div className="pharmacy-stat-label">Paid Orders</div>
              <div className="pharmacy-stat-value">{summary?.paid_orders ?? 0}</div>
            </div>

            <div className="pharmacy-stat-card warning">
              <div className="pharmacy-stat-icon warning">⏳</div>
              <div className="pharmacy-stat-label">Pending Payments</div>
              <div className="pharmacy-stat-value">{summary?.pending_payments ?? 0}</div>
            </div>
          </section>

          {/* Charts Row */}
          <div className="pharmacy-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
            {/* Revenue Trend Chart */}
            <section className="pharmacy-card">
              <h3 className="pharmacy-card-title">📈 Revenue Trend</h3>
              <p className="pharmacy-muted" style={{ marginBottom: '20px' }}>Last 7 days revenue overview</p>
              
              {revenueSeries.length === 0 ? (
                <div className="pharmacy-empty" style={{ padding: '40px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
                  No revenue data available
                </div>
              ) : (
                <div className="pharmacy-chart-container">
                  <div className="pharmacy-bar-chart">
                    {revenueSeries.map((point, index) => {
                      const height = maxRevenue > 0 ? (point.amount / maxRevenue) * 100 : 0
                      const date = new Date(point.date)
                      return (
                        <div className="pharmacy-bar-wrapper" key={`${point.date}-${index}`}>
                          <div className="pharmacy-bar-value">
                            {point.amount > 0 ? `₹${point.amount.toLocaleString()}` : '₹0'}
                          </div>
                          <div 
                            className="pharmacy-bar" 
                            style={{ 
                              height: `${Math.max(height, 3)}%`,
                              minHeight: '4px'
                            }}
                          />
                          <div className="pharmacy-bar-label">
                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Delivery Status Breakdown */}
            <section className="pharmacy-card">
              <h3 className="pharmacy-card-title">🚚 Delivery Status Breakdown</h3>
              <p className="pharmacy-muted" style={{ marginBottom: '20px' }}>Orders by delivery status</p>
              
              {deliveryTotal <= 1 && Object.keys(deliveryBreakdown).length === 0 ? (
                <div className="pharmacy-empty" style={{ padding: '40px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
                  No delivery data available
                </div>
              ) : (
                <div className="pharmacy-donut-container">
                  <div className="pharmacy-donut">
                    <svg viewBox="0 0 100 100" className="pharmacy-donut-svg">
                      {(() => {
                        let cumulativePercent = 0
                        const entries = Object.entries(deliveryBreakdown)
                        
                        return entries.map(([status, count], index) => {
                          const percent = (count / deliveryTotal) * 100
                          const strokeDasharray = `${percent} ${100 - percent}`
                          const strokeDashoffset = -cumulativePercent
                          cumulativePercent += percent

                          return (
                            <circle
                              key={status}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={deliveryColors[status] || '#94a3b8'}
                              strokeWidth="12"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              transform="rotate(-90 50 50)"
                              style={{ transition: 'all 0.3s ease' }}
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div className="pharmacy-donut-center">
                      <div className="pharmacy-donut-total">{deliveryTotal}</div>
                      <div className="pharmacy-donut-label">Total</div>
                    </div>
                  </div>
                  
                  <div className="pharmacy-donut-legend">
                    {Object.entries(deliveryBreakdown).map(([status, count]) => (
                      <div className="pharmacy-legend-item" key={status}>
                        <span 
                          className="pharmacy-legend-dot" 
                          style={{ backgroundColor: deliveryColors[status] || '#94a3b8' }}
                        />
                        <span className="pharmacy-legend-label">{status}</span>
                        <span className="pharmacy-legend-value">{count}</span>
                        <span className="pharmacy-legend-percent">
                          ({((count / deliveryTotal) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Top Selling Medicines */}
          <section className="pharmacy-card">
            <div className="pharmacy-card-row" style={{ marginBottom: '20px' }}>
              <div>
                <h3 className="pharmacy-card-title">🏆 Top Selling Medicines</h3>
                <p className="pharmacy-muted">Best performing products by quantity sold</p>
              </div>
            </div>
            
            {topMedicines.length === 0 ? (
              <div className="pharmacy-empty" style={{ padding: '40px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💊</div>
                No sales data available yet
              </div>
            ) : (
              <div className="pharmacy-top-medicines">
                {topMedicines.map((medicine, index) => {
                  const percentage = (medicine.total_quantity / maxMedicineSales) * 100
                  const rankColors = ['#fbbf24', '#94a3b8', '#cd7f32', '#6366f1', '#8b5cf6']
                  
                  return (
                    <div className="pharmacy-medicine-rank" key={medicine.medicine__name || index}>
                      <div className="pharmacy-rank-number" style={{ backgroundColor: rankColors[index] || '#64748b' }}>
                        {index + 1}
                      </div>
                      <div className="pharmacy-rank-info">
                        <div className="pharmacy-rank-header">
                          <span className="pharmacy-rank-name">{medicine.medicine__name || medicine.name}</span>
                          <span className="pharmacy-rank-qty">{medicine.total_quantity} units</span>
                        </div>
                        <div className="pharmacy-rank-bar-container">
                          <div 
                            className="pharmacy-rank-bar" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: rankColors[index] || '#64748b'
                            }} 
                          />
                        </div>
                        <div className="pharmacy-rank-revenue">
                          Revenue: ₹{(medicine.total_revenue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Payment Status Summary */}
          <section className="pharmacy-card">
            <h3 className="pharmacy-card-title" style={{ marginBottom: '20px' }}>💳 Payment Status Overview</h3>
            
            <div className="pharmacy-payment-summary">
              <div className="pharmacy-payment-box paid">
                <div className="pharmacy-payment-icon">✅</div>
                <div className="pharmacy-payment-details">
                  <div className="pharmacy-payment-label">Paid Orders</div>
                  <div className="pharmacy-payment-value">{summary?.paid_orders ?? 0}</div>
                  <div className="pharmacy-payment-amount">
                    ₹{(summary?.paid_amount ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="pharmacy-payment-percent">
                  {summary?.total_orders ? ((summary.paid_orders / summary.total_orders) * 100).toFixed(1) : 0}%
                </div>
              </div>

              <div className="pharmacy-payment-box pending">
                <div className="pharmacy-payment-icon">⏳</div>
                <div className="pharmacy-payment-details">
                  <div className="pharmacy-payment-label">Pending Payments</div>
                  <div className="pharmacy-payment-value">{summary?.pending_payments ?? 0}</div>
                  <div className="pharmacy-payment-amount">
                    ₹{(summary?.pending_amount ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="pharmacy-payment-percent">
                  {summary?.total_orders ? ((summary.pending_payments / summary.total_orders) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="pharmacy-payment-progress">
              <div className="pharmacy-progress-label">
                <span>Collection Rate</span>
                <span>{summary?.total_orders ? ((summary.paid_orders / summary.total_orders) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="pharmacy-progress-bar">
                <div 
                  className="pharmacy-progress-fill"
                  style={{ 
                    width: `${summary?.total_orders ? (summary.paid_orders / summary.total_orders) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </section>
        </>
      )}
    </PharmacyLayout>
  )
}

export default Payments
