import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import '../admin/AdminShared.css'
import DashboardHome from '../admin/DashboardHome.jsx'
import Appointments from '../admin/Appointments.jsx'
import Patients from '../admin/Patients.jsx'
import Doctors from '../admin/Doctors.jsx'
import Departments from '../admin/Departments.jsx'
import PharmacyStock from '../admin/PharmacyStock.jsx'
import AddDoctor from '../admin/AddDoctor.jsx'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Dashboard Summary Data
  const [dashboardStats, setDashboardStats] = useState({
    patientsCount: 0,
    doctorsCount: 0,
    appointmentsCount: 0,
    revenue: 0,
    recentAppointments: []
  })

  // Other specific states for "Add Doctor" or "Messages" (which weren't requested to be refactored but good to keep)
  const [departmentsForForm, setDepartmentsForForm] = useState([])
  const [messages, setMessages] = useState([])
  const [payments, setPayments] = useState({ consultations: { count: 0, total_amount: 0 }, pharmacy: { count: 0, total_amount: 0 } })

  const menuItems = useMemo(
    () => [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'appointments', label: 'Appointments', icon: '📅' },
      { key: 'patients', label: 'Patients', icon: '🧑‍⚕️' },
      { key: 'doctors', label: 'Doctors', icon: '🩺' },
      { key: 'departments', label: 'Departments', icon: '🏥' },
      { key: 'payments', label: 'Payments', icon: '💳' },
      { key: 'pharmacy', label: 'Pharmacy Stock', icon: '💊' },
      { key: 'add-doctor', label: 'Add Doctor', icon: '➕' }, // kept as is
      { key: 'messages', label: 'Messages', icon: '💬' },   // kept as is
      { key: 'logout', label: 'Logout', icon: '🚪' },
    ],
    [],
  )

  const handleMenuClick = (key) => {
    if (key === 'logout') {
      localStorage.removeItem('role')
      localStorage.removeItem('email')
      navigate('/')
      return
    }
    setActive(key)
    setMobileMenuOpen(false) // Close mobile menu on navigation
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Load Dashboard Summary Data
  const loadDashboardData = async () => {
    try {
      const [patRes, docRes, appRes, payRes] = await Promise.all([
        api.get('accounts/admin/patients/'),
        api.get('accounts/admin/doctors/'),
        api.get('consultations/appointments/'),
        api.get('payments/summary/')
      ])

      const patients = patRes.data || []
      const doctors = docRes.data || []
      let appointments = Array.isArray(appRes.data) ? appRes.data : []
      const paymentData = payRes.data || { consultations: { total_amount: 0 }, pharmacy: { total_amount: 0 } }

      // Calculate Revenue
      const totalRev = (paymentData.consultations?.total_amount || 0) + (paymentData.pharmacy?.total_amount || 0)

      // Recent Appointments Logic (Client side sort for now matching previous logic)
      const confirmedApps = appointments.filter(a => String(a.status || '').toLowerCase().includes('confirm'))
      // Sort by latest (assuming ID or date) - reusing logic roughly or just slicing
      const recent = confirmedApps.slice(0, 8)

      setDashboardStats({
        patientsCount: patients.length,
        doctorsCount: doctors.length,
        appointmentsCount: confirmedApps.length,
        revenue: totalRev,
        recentAppointments: recent
      })
      setPayments(paymentData)
    } catch (e) {
      console.error("Failed to load dashboard data", e)
    }
  }

  const loadDepartments = async () => {
    try {
      const res = await api.get('doctors/departments/')
      setDepartmentsForForm(res.data || [])
    } catch (e) { console.error(e) }
  }

  const loadMessages = async () => {
    try {
      const res = await api.get('accounts/admin/messages/')
      setMessages(res.data || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (active === 'dashboard') {
      loadDashboardData()
    }
    if (active === 'add-doctor') {
      loadDepartments()
    }
    if (active === 'messages') {
      loadMessages()
    }
    if (active === 'payments') {
      // Re-fetch payments specific if needed, or use dashboard data. 
      // The original code re-fetched everything on dashboard.
      api.get('payments/summary/').then(res => setPayments(res.data)).catch(() => { })
    }
  }, [active])




  // Payments calculations
  const totalRevenue = (payments.consultations?.total_amount || 0) + (payments.pharmacy?.total_amount || 0)
  const consultationPercent = totalRevenue ? Math.round(((payments.consultations?.total_amount || 0) / totalRevenue) * 100) : 0
  const pharmacyPercent = totalRevenue ? Math.round(((payments.pharmacy?.total_amount || 0) / totalRevenue) * 100) : 0


  return (
    <div
      className={`admin-shell admin-dashboard-shell ${sidebarCollapsed ? 'collapsed' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
    >
      {/* Mobile Overlay */}
      <div 
        className={`admin-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      <header
        className="admin-topbar"
        style={{
          flex: '0 0 auto',
          position: 'sticky',
          top: 0,
          zIndex: 260,
          background: '#ffffff',
          padding: '1rem 2rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            type="button"
            className="admin-topbar-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-nav"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm admin-collapse-btn"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            style={{ 
              padding: '10px 16px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#475569',
              transition: 'all 0.25s ease'
            }}
          >
            {sidebarCollapsed ? '☰ Expand' : '✕ Collapse'}
          </button>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Welcome back, Admin</span>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Here's what's happening today</p>
          </div>
        </div>
        <div className="topbar-right" style={{ 
          padding: '10px 18px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🛡️</span> Admin Dashboard
        </div>
      </header>

      {/* Mobile Dropdown Navigation */}
      <div
        id="admin-mobile-nav"
        className={`admin-mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}
        role="menu"
        aria-label="Admin navigation"
      >
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`admin-mobile-nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.key)}
            role="menuitem"
          >
            <span className="admin-mobile-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="admin-mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
        <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
          background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
          padding: sidebarCollapsed ? '28px 14px' : '28px 18px',
          width: sidebarCollapsed ? '88px' : '280px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="admin-brand" style={{ 
            marginBottom: '2rem', 
            padding: '0 8px',
            opacity: sidebarCollapsed ? 0 : 1,
            transition: 'opacity 0.2s ease'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '1.15rem', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff, #c7d2fe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Smart Telemedicine</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</p>
          </div>
          <nav className="admin-menu" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                className={`admin-menu-item ${active === item.key ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.key)}
                type="button"
                style={{
                  border: 'none',
                  background: active === item.key ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: active === item.key ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: active === item.key ? 600 : 500,
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                  width: '100%',
                  boxShadow: active === item.key ? '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)' : 'none'
                }}
              >
                <span className="menu-icon" style={{ fontSize: '1.25rem', flexShrink: 0, width: '24px', textAlign: 'center' }}>{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main" style={{ 
          flex: '1 1 auto', 
          minWidth: 0, 
          overflow: 'hidden',
          background: '#f8fafc'
        }}>
          <section
            className="admin-content"
            style={{ 
              height: '100%', 
              overflowY: 'auto', 
              overflowX: 'hidden', 
              padding: '2rem',
              scrollBehavior: 'smooth'
            }}
          >
            {active === 'dashboard' && (
              <DashboardHome
                totalPatients={dashboardStats.patientsCount}
                totalDoctors={dashboardStats.doctorsCount}
                totalAppointments={dashboardStats.appointmentsCount}
                totalRevenue={dashboardStats.revenue}
                recentAppointments={dashboardStats.recentAppointments}
              />
            )}

            {active === 'appointments' && <Appointments />}
            {active === 'patients' && <Patients />}
            {active === 'doctors' && <Doctors />}
            {active === 'departments' && <Departments />}
            {active === 'pharmacy' && <PharmacyStock />}

            {/* Keeping obscure/less requested pages inline or simpler for now to avoid over-engineering if not asked */}
            {active === 'payments' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{ 
                      width: '4px', 
                      height: '24px', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                      borderRadius: '999px' 
                    }}></span>
                    Payments Overview
                  </h2>
                  <p style={{ margin: '0.5rem 0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>Track consultation and pharmacy revenue</p>
                </div>
                <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div className="admin-card" style={{ 
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, #ffffff 100%)',
                    borderTop: '4px solid #6366f1'
                  }}>
                    <div className="admin-card-header">
                      <div>
                        <h4 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🏥</span> Consultation Payments
                        </h4>
                      </div>
                    </div>
                    <div className="admin-card-body">
                      <div className="admin-card-row"><span className="admin-card-label">Total Transactions</span><strong className="admin-card-value">{payments.consultations?.count || 0}</strong></div>
                      <div className="admin-card-row"><span className="admin-card-label">Total Revenue</span><strong className="admin-card-value" style={{ color: '#059669', fontSize: '1.1rem' }}>₹{(payments.consultations?.total_amount || 0).toFixed(2)}</strong></div>
                    </div>
                  </div>
                  <div className="admin-card" style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, #ffffff 100%)',
                    borderTop: '4px solid #10b981'
                  }}>
                    <div className="admin-card-header">
                      <div>
                        <h4 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>💊</span> Pharmacy Payments
                        </h4>
                      </div>
                    </div>
                    <div className="admin-card-body">
                      <div className="admin-card-row"><span className="admin-card-label">Total Orders</span><strong className="admin-card-value">{payments.pharmacy?.count || 0}</strong></div>
                      <div className="admin-card-row"><span className="admin-card-label">Total Revenue</span><strong className="admin-card-value" style={{ color: '#059669', fontSize: '1.1rem' }}>₹{(payments.pharmacy?.total_amount || 0).toFixed(2)}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="admin-card" style={{ maxWidth: '650px' }}>
                  <div className="admin-card-header">
                    <h4 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📊</span> Revenue Distribution
                    </h4>
                  </div>
                  <div className="admin-chart" style={{ padding: '1.25rem' }}>
                    <div className="chart-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ width: '120px', fontWeight: 600, color: '#475569' }}>Consultations</span>
                      <div className="chart-bar" style={{ flex: 1, background: '#e2e8f0', height: '14px', borderRadius: '999px', margin: '0 16px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div className="chart-fill" style={{ width: `${consultationPercent}%`, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', height: '100%', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#6366f1', minWidth: '50px', textAlign: 'right' }}>{consultationPercent}%</span>
                    </div>
                    <div className="chart-row" style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '120px', fontWeight: 600, color: '#475569' }}>Pharmacy</span>
                      <div className="chart-bar" style={{ flex: 1, background: '#e2e8f0', height: '14px', borderRadius: '999px', margin: '0 16px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div className="chart-fill alt" style={{ width: `${pharmacyPercent}%`, background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', height: '100%', borderRadius: '999px', transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#10b981', minWidth: '50px', textAlign: 'right' }}>{pharmacyPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {active === 'add-doctor' && (
              <AddDoctor departments={departmentsForForm} />
            )}

            {active === 'messages' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{ 
                      width: '4px', 
                      height: '24px', 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                      borderRadius: '999px' 
                    }}></span>
                    Messages
                  </h2>
                  <p style={{ margin: '0.5rem 0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>User messages and feedback</p>
                </div>
                <div className="admin-grid">
                  {messages.length === 0 ? (
                    <div className="empty-state">No messages found.</div>
                  ) : (
                    messages.map((msg, index) => (
                      <div className="admin-card admin-message-card" key={msg.id} style={{ 
                        animationDelay: `${index * 0.05}s`,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, #ffffff 100%)'
                      }}>
                        <div className="admin-card-header admin-message-card-header">
                          <div>
                            <h4 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.9rem',
                                fontWeight: 700
                              }}>
                                {(msg.user_email || 'U')[0].toUpperCase()}
                              </span>
                              <div style={{ flex: 1 }}>
                                <span className="admin-message-email" style={{ display: 'block', fontWeight: 600 }}>{msg.user_email}</span>
                                {msg.user_phone && (
                                  <span style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    fontSize: '0.8rem', 
                                    color: '#64748b',
                                    marginTop: '2px'
                                  }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                                    </svg>
                                    {msg.user_phone}
                                  </span>
                                )}
                              </div>
                            </h4>
                          </div>
                          <span className="status-badge status-default" style={{ 
                            background: msg.user_role === 'doctor' 
                              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))' 
                              : msg.user_role === 'patient'
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08))'
                              : 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.08))',
                            color: msg.user_role === 'doctor' ? '#059669' : msg.user_role === 'patient' ? '#6366f1' : '#475569',
                            border: `1px solid ${msg.user_role === 'doctor' ? 'rgba(16, 185, 129, 0.3)' : msg.user_role === 'patient' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`
                          }}>{msg.user_role}</span>
                        </div>
                        <div className="admin-card-body">
                          <p style={{ 
                            color: '#475569', 
                            lineHeight: 1.6, 
                            margin: 0,
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            borderLeft: '3px solid #e2e8f0'
                          }}>{msg.message}</p>
                          <p className="admin-card-subtitle" style={{ 
                            textAlign: 'right', 
                            marginTop: '1rem', 
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.5rem'
                          }}>
                            <span>🕐</span>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export { AdminDashboard }
export default AdminDashboard
