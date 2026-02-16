import { Navigate, Outlet, useLocation } from 'react-router-dom'

const devLog = (...args) => {
  if (import.meta?.env?.DEV) console.log(...args)
}

const normalizeAllowedRoles = (allowedRole, allowedRoles) => {
  if (Array.isArray(allowedRoles) && allowedRoles.length) return allowedRoles
  if (typeof allowedRole === 'string' && allowedRole) return [allowedRole]
  return []
}

// Protected route based on localStorage auth state.
// - No token => redirect to correct login
// - Role mismatch => redirect home
// - Otherwise => render nested routes (<Outlet />)
const ProtectedRoute = ({ allowedRole, allowedRoles }) => {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const roles = normalizeAllowedRoles(allowedRole, allowedRoles)
  const needsPatient = roles.includes('patient')

  devLog('[ProtectedRoute] check:', {
    path: location.pathname,
    tokenPresent: Boolean(token),
    role,
    allowed: roles,
  })

  if (!token) {
    const loginPath = needsPatient ? '/patient/login' : '/role/login'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (!role) {
    const loginPath = needsPatient ? '/patient/login' : '/role/login'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
