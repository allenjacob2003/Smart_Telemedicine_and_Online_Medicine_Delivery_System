import React, { useState, useMemo } from 'react'
import './AdminShared.css'

const DashboardHome = ({
  totalPatients = 0,
  totalDoctors = 0,
  totalAppointments = 0,
  totalRevenue = 0,
  recentAppointments = [],
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecents = useMemo(() => {
    if (!searchQuery.trim()) return recentAppointments
    const query = searchQuery.toLowerCase()
    return recentAppointments.filter((a) => {
      const pName = a.patient_name || a.patient || a.patientName || ''
      const dName = a.doctor_name || a.doctorName || ''
      return (
        pName.toLowerCase().includes(query) ||
        dName.toLowerCase().includes(query)
      )
    })
  }, [recentAppointments, searchQuery])

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading" style={{ minHeight: '400px' }}>
          <div className="admin-loading-spinner"></div>
          <span className="admin-loading-text">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page" style={{ animation: 'fadeInUp 0.4s ease' }}>
      {/* Stats Section */}
      <section className="admin-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-card stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.08) 0%, #ffffff 100%)',
          borderTop: '4px solid #4facfe'
        }}>
          <div className="admin-card-body" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Patients</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>{totalPatients}</div>
          </div>
        </div>
        <div className="admin-card stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, #ffffff 100%)',
          borderTop: '4px solid #00f2fe'
        }}>
          <div className="admin-card-body" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Doctors</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>{totalDoctors}</div>
          </div>
        </div>
        <div className="admin-card stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.08) 0%, #ffffff 100%)',
          borderTop: '4px solid #43e97b'
        }}>
          <div className="admin-card-body" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appointments</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>{totalAppointments}</div>
          </div>
        </div>
        <div className="admin-card stat-card" style={{ 
          background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.08) 0%, #ffffff 100%)',
          borderTop: '4px solid #fa709a'
        }}>
          <div className="admin-card-body" style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💰</div>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</h4>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.5rem' }}>₹{Number(totalRevenue).toFixed(2)}</div>
          </div>
        </div>
      </section>
    </div>
  )
}

DashboardHome.displayName = 'DashboardHome'

export { DashboardHome }
export default DashboardHome
