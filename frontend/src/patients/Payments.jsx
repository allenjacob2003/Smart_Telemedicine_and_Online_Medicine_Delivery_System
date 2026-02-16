import { useState, useEffect } from 'react'
import PatientLayout from '../dashboard/PatientLayout.jsx'
import api from '../api/axios'
import './Payments.css'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    filterPaymentsData()
  }, [searchTerm, filterType, filterStatus, payments])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const email = localStorage.getItem('email')

      // Fetch all payments from the payments endpoint
      const paymentsRes = await api.get('payments/list/', { params: { email } })
      const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data?.results || []

      // Format payments
      const formattedPayments = paymentsData
        .filter(payment => payment.status === 'success')
        .map(payment => {
          const idPrefix = payment.payment_type === 'consultation' ? 'CON' : 'MED'
          return {
            id: `${idPrefix}-${payment.id}`,
            type: payment.payment_type === 'consultation' ? 'Consultation' : 'Medicine',
            description: payment.description || 'Payment',
            amount: payment.amount,
            date: payment.created_at,
            status: 'Paid',
            paymentId: payment.razorpay_payment_id || 'N/A',
            orderId: payment.razorpay_order_id || 'N/A'
          }
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      setPayments(formattedPayments)
      setFilteredPayments(formattedPayments)
    } catch (err) {
      console.error('Error loading payments:', err)
      setPayments([])
      setFilteredPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filterPaymentsData = () => {
    let filtered = [...payments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(payment => payment.type.toLowerCase() === filterType.toLowerCase())
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === filterStatus.toLowerCase())
    }

    setFilteredPayments(filtered)
  }

  const getPaymentStats = () => {
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const consultationTotal = payments.filter(p => p.type === 'Consultation').reduce((sum, p) => sum + (p.amount || 0), 0)
    const medicineTotal = payments.filter(p => p.type === 'Medicine').reduce((sum, p) => sum + (p.amount || 0), 0)

    return {
      total: payments.length,
      totalAmount,
      consultationTotal,
      medicineTotal,
      consultationCount: payments.filter(p => p.type === 'Consultation').length,
      medicineCount: payments.filter(p => p.type === 'Medicine').length
    }
  }

  const stats = getPaymentStats()

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return 'N/A'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  return (
    <PatientLayout pageTitle="Payment History">
      <div className="payments-container">
        {/* Header Section */}
        <section className="payments-header">
          <div>
            <h2>Payments & Transactions</h2>
            <p className="payments-subtitle">Track all your payment history and transactions</p>
          </div>
        </section>

        {loading ? (
          <div className="payments-loading">
            <div className="payments-spinner"></div>
            <span>Loading payment history...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <section className="payments-stats-grid">
              <div className="payment-stat-card primary">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <p>Total Spent</p>
                  <h3>{formatCurrency(stats.totalAmount)}</h3>
                  <span>{stats.total} transactions</span>
                </div>
              </div>

              <div className="payment-stat-card consultation">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-content">
                  <p>Consultations</p>
                  <h3>{formatCurrency(stats.consultationTotal)}</h3>
                  <span>{stats.consultationCount} payments</span>
                </div>
              </div>

              <div className="payment-stat-card medicine">
                <div className="stat-icon">💊</div>
                <div className="stat-content">
                  <p>Medicines</p>
                  <h3>{formatCurrency(stats.medicineTotal)}</h3>
                  <span>{stats.medicineCount} orders</span>
                </div>
              </div>

              <div className="payment-stat-card success">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                  <p>Success Rate</p>
                  <h3>100%</h3>
                  <span>All payments successful</span>
                </div>
              </div>
            </section>

            {/* Filters Section */}
            <section className="payments-filters-card">
              <div className="filters-header">
                <h4>Transaction History</h4>
                <div className="filters-controls">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by ID, description, or payment ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="consultation">Consultation</option>
                    <option value="medicine">Medicine</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="results-info">
                Showing <strong>{filteredPayments.length}</strong> of <strong>{payments.length}</strong> transactions
              </div>

              {/* Payments Table */}
              {filteredPayments.length === 0 ? (
                <div className="payments-empty">
                  <div className="empty-icon">📭</div>
                  <h4>No payments found</h4>
                  <p>
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your payment history will appear here once you make a transaction'}
                  </p>
                </div>
              ) : (
                <div className="payments-table-wrapper">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Date & Time</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td data-label="Transaction ID">
                            <span className="transaction-id">{payment.id}</span>
                          </td>
                          <td data-label="Type">
                            <span className={`payment-type-badge ${payment.type.toLowerCase()}`}>
                              {payment.type === 'Consultation' ? '👨‍⚕️' : '💊'} {payment.type}
                            </span>
                          </td>
                          <td data-label="Description" className="description-cell">{payment.description}</td>
                          <td data-label="Date & Time" className="date-cell">{formatDate(payment.date)}</td>
                          <td data-label="Amount" className="amount-cell">
                            <strong>{formatCurrency(payment.amount)}</strong>
                          </td>
                          <td data-label="Status">
                            <span className={`status-badge ${payment.status.toLowerCase()}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td data-label="Payment ID" className="payment-id-cell">
                            <code>{payment.paymentId}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Info Cards */}
            {payments.length > 0 && (
              <section className="payments-info-grid">
                <div className="info-card">
                  <div className="info-icon">🔒</div>
                  <div>
                    <h5>Secure Payments</h5>
                    <p>All transactions are encrypted and secured by Razorpay</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">📧</div>
                  <div>
                    <h5>Email Receipts</h5>
                    <p>Payment confirmations are sent to your registered email</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">💳</div>
                  <div>
                    <h5>Multiple Payment Methods</h5>
                    <p>Credit/Debit cards, UPI, Net Banking, and Wallets supported</p>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PatientLayout>
  )
}

export default Payments
