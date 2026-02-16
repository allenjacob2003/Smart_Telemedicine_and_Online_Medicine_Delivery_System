import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import './doctorLayout.css'

const DoctorLayout = ({ doctorName, children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const name = doctorName || localStorage.getItem('doctorName') || localStorage.getItem('name') || 'Doctor'
  const safeName = (name || '').trim() || 'Doctor'
  const profilePhoto =
    localStorage.getItem('doctorPhoto') ||
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(safeName) + '&background=4f7cff&color=ffffff'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/role/login', { replace: true })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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

  return (
    <div className="doctor-layout">
      {/* Mobile Menu Toggle Button */}
      <button 
        type="button" 
        className="doctor-mobile-toggle"
        onClick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`doctor-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      />

      <aside className={`doctor-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="doctor-profile">
          <img className="doctor-avatar" src={profilePhoto} alt={`Dr. ${safeName}`} />
          <div className="doctor-name">Dr. {safeName}</div>
        </div>

        <nav className="doctor-menu">
          <NavLink
            className={({ isActive }) =>
              `doctor-menu-item${isActive ? ' active' : ''}`
            }
            to="/doctor/dashboard"
            onClick={closeMobileMenu}
          >
            Confirmed Appointments
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `doctor-menu-item${isActive ? ' active' : ''}`
            }
            to="/doctor/consultation-requests"
            onClick={closeMobileMenu}
          >
            Consultation Requests
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `doctor-menu-item${isActive ? ' active' : ''}`
            }
            to="/doctor/prescription-upload"
            onClick={closeMobileMenu}
          >
            Prescription Upload
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `doctor-menu-item${isActive ? ' active' : ''}`
            }
            to="/doctor/prescription-history"
            onClick={closeMobileMenu}
          >
            Prescription History
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `doctor-menu-item${isActive ? ' active' : ''}`
            }
            to="/doctor/profile-settings"
            onClick={closeMobileMenu}
          >
            Profile Settings
          </NavLink>
          <button type="button" className="doctor-menu-item doctor-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <div className="doctor-content">
        <header className="doctor-topbar">
          <button 
            type="button" 
            className="doctor-topbar-toggle"
            onClick={toggleMobileMenu}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="doctor-welcome">Welcome Dr. {safeName}</div>
          <div className="doctor-title">Doctor Dashboard</div>
        </header>

        <main className="doctor-main">{children}</main>
      </div>
    </div>
  )
}

export default DoctorLayout
