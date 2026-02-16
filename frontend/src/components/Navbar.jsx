import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const role = localStorage.getItem('role')
  const email = localStorage.getItem('email')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Smart Telemedicine</Link>
      </div>
      <div className="navbar-links">
        {!role && (
          <>
            <Link to="/patient/login">Patient Login</Link>
            <Link to="/patient/register">Patient Register</Link>
            <Link to="/role/login">Role Login</Link>
          </>
        )}

        {role === 'patient' && <Link to="/patient/dashboard">Dashboard</Link>}
        {role === 'doctor' && <Link to="/doctor/dashboard">Doctor Dashboard</Link>}
        {role === 'pharmacy' && <Link to="/pharmacy/dashboard">Pharmacy Dashboard</Link>}
        {role === 'admin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
      </div>
      <div className="navbar-user">
        {email ? (
          <>
            <span className="user-email">{email}</span>
            <button type="button" className="btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  )
}

export default Navbar
