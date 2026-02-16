import { useMemo } from 'react'
import './AdminLayout.css'

const AdminLayout = ({
  activeKey = 'dashboard',
  onNavigate = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
  title = 'Admin Dashboard',
  subtitle = 'Welcome, Admin',
  rightTitle = 'Admin Dashboard',
  children,
}) => {
  const menuItems = useMemo(
    () => [
      { key: 'dashboard', label: 'Dashboard' },
      { key: 'appointments', label: 'Appointments' },
      { key: 'patients', label: 'Patients (Block/Unblock)' },
      { key: 'doctors', label: 'Doctors (Block/Unblock)' },
      { key: 'departments', label: 'Departments' },
      { key: 'payments', label: 'Payments' },
      { key: 'pharmacy', label: 'Pharmacy Stock' },
      { key: 'add-doctor', label: 'Add Doctor' },
      { key: 'messages', label: 'Messages' },
      { key: 'logout', label: 'Logout' },
    ],
    [],
  )

  return (
    <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
        <div className="admin-brand">
          <p className="brand-title">Smart Telemedicine</p>
          {!collapsed && <p className="brand-subtitle">Admin Panel</p>}
        </div>

        <nav className="admin-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`menu-item ${activeKey === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
              title={item.label}
            >
              {!collapsed && <span className="menu-label">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="btn btn-light" type="button" onClick={onToggleCollapse}>
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
            <div className="topbar-text">
              <p className="topbar-title">{title}</p>
              <p className="topbar-subtitle">{subtitle}</p>
            </div>
          </div>
          <div className="topbar-right">{rightTitle}</div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
