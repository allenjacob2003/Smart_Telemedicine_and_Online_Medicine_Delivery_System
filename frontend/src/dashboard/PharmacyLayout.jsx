import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import './pharmacyLayout.css'

const PharmacyLayout = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [flash, setFlash] = useState(null) // { type?: 'success'|'error'|'info', message: string }

  const profilePhoto =
    localStorage.getItem('pharmacyPhoto') ||
    'https://ui-avatars.com/api/?name=Pharmacy&background=16a34a&color=ffffff'
  const pharmacyName = localStorage.getItem('pharmacyName') || 'City Pharmacy'

  const handleLogout = () => {
    localStorage.clear()
    navigate('/role/login', { replace: true })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen((v) => !v)
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

  // Show one-time flash message passed via navigation state:
  // navigate('/somewhere', { state: { flash: { type: 'success', message: '...' } }})
  useEffect(() => {
    const next = location.state?.flash
    if (!next) return
    const normalized = typeof next === 'string' ? { type: 'info', message: next } : next
    if (!normalized?.message) return

    setFlash(normalized)

    const t = window.setTimeout(() => setFlash(null), 4000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  return (
    <div className={`pharmacy-layout ${mobileMenuOpen ? 'is-mobile-open' : ''}`}>
      {/* Mobile behavior overrides (kept here so you don't need to chase CSS) */}
      <style>{`
        @media (max-width: 768px) {
          .pharmacy-layout { --pharmacy-topbar-h: 56px; }

          /* IMPORTANT: prevent the sidebar from taking layout space on mobile */
          .pharmacy-layout {
            display: block !important; /* kills flex "reserved sidebar space" */
          }

          /* If any wrapper has transform, fixed-position can break. Neutralize. */
          .pharmacy-layout,
          .pharmacy-content,
          .pharmacy-main {
            transform: none !important;
            filter: none !important;
            perspective: none !important;
          }

          /* Hide header texts on mobile */
          .pharmacy-welcome,
          .pharmacy-title {
            display: none !important;
          }

          /* Header always visible even when page is scrolled */
          .pharmacy-topbar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: var(--pharmacy-topbar-h);
            z-index: 2000;
          }

          /* Content sits below fixed header */
          .pharmacy-content {
            padding-top: var(--pharmacy-topbar-h);
            margin-left: 0 !important;
          }

          /* Overlay covers the dashboard content (no reserved gap) */
          .pharmacy-mobile-overlay {
            position: fixed !important;
            inset: 0 !important;
            background: rgba(15, 23, 42, 0.45);
            z-index: 1500;
            display: none;
            border: 0;
            padding: 0;
          }
          .pharmacy-mobile-overlay.active { display: block; }

          /* Sidebar is a true overlay; never participates in layout */
          .pharmacy-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100dvh !important;
            width: min(78vw, 420px);
            min-width: 260px;
            margin: 0 !important;
            padding-top: 0 !important;
            border-radius: 0 !important;

            flex: none !important; /* extra safety against flex layouts */
            overflow-y: auto;

            transform: translateX(-110%);
            transition: transform 200ms ease;
            z-index: 1600;

            display: flex;
            flex-direction: column;
          }
          .pharmacy-sidebar.open { transform: translateX(0); }

          /* Sidebar alignment (vertical list) */
          .pharmacy-profile { flex: 0 0 auto; margin-top: 0 !important; padding-top: 16px; }
          .pharmacy-menu {
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
          }
          .pharmacy-menu-item {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            line-height: 1.2;
            white-space: nowrap;
          }
          .pharmacy-menu-item.pharmacy-logout { margin-top: auto; }
        }

        @media (min-width: 769px) {
          .pharmacy-topbar-toggle { display: none; }
          .pharmacy-mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* Mobile Overlay (click to close) */}
      <button
        type="button"
        className={`pharmacy-mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-label="Close menu"
        tabIndex={mobileMenuOpen ? 0 : -1}
      />

      <aside
        id="pharmacy-sidebar"
        className={`pharmacy-sidebar ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Pharmacy navigation"
      >
        <div className="pharmacy-profile">
          <img className="pharmacy-avatar" src={profilePhoto} alt="Pharmacy" />
          <div className="pharmacy-name">{pharmacyName}</div>
        </div>

        <nav className="pharmacy-menu">
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/dashboard"
            onClick={closeMobileMenu}
          >
            Dashboard
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/orders"
            onClick={closeMobileMenu}
          >
            Medicine Orders
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/update-order"
            onClick={closeMobileMenu}
          >
            Update Order Status
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/stock"
            onClick={closeMobileMenu}
          >
            Stock Management
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/add-medicine"
            onClick={closeMobileMenu}
          >
            Add Medicine
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/payments"
            onClick={closeMobileMenu}
          >
            Payments Summary
          </NavLink>
          <NavLink
            className={({ isActive }) => `pharmacy-menu-item${isActive ? ' active' : ''}`}
            to="/pharmacy/profile-settings"
            onClick={closeMobileMenu}
          >
            Profile
          </NavLink>
          <button type="button" className="pharmacy-menu-item pharmacy-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <div className="pharmacy-content">
        <header className="pharmacy-topbar">
          <button
            type="button"
            className="pharmacy-topbar-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="pharmacy-sidebar"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className="pharmacy-title">Pharmacy Dashboard</div>
        </header>
        <main className="pharmacy-main">{children}</main>
      </div>

      {flash?.message ? (
        <div className={`pharmacy-flash ${flash.type || 'info'}`} role="status" aria-live="polite">
          <div className="pharmacy-flash-msg">{flash.message}</div>
          <button
            type="button"
            className="pharmacy-flash-close"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default PharmacyLayout
