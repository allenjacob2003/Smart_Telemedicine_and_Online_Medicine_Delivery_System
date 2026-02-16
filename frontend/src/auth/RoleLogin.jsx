import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './RoleLogin.css'

const RoleLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('doctor')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await api.post('accounts/role-login/', {
        email,
        password,
        role,
      })

      const devLog = (...args) => {
        if (import.meta?.env?.DEV) console.log(...args)
      }

      const getFallbackToken = () => {
        try {
          return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}`
        } catch {
          return `local-${Date.now()}`
        }
      }

      devLog('[RoleLogin] login response:', response?.data)

      const { user } = response.data || {}
      const token = response?.data?.token || getFallbackToken()
      const displayName = user?.full_name || user?.name || email.split('@')[0]

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('email', email)
      localStorage.setItem('name', displayName)
      if (role === 'doctor') localStorage.setItem('doctorName', displayName)
      if (role === 'pharmacy') localStorage.setItem('pharmacyName', displayName)
      if (role === 'admin') localStorage.setItem('adminName', displayName)

      if (role === 'doctor') navigate('/doctor/dashboard')
      if (role === 'pharmacy') navigate('/pharmacy/dashboard')
      if (role === 'admin') navigate('/admin/dashboard')
    } catch (err) {
      const message = err?.response?.data?.detail || 'Login failed'
      setError(message)
    }
  }

  const showMessageAdmin = error === 'Account blocked'

  return (
    <div className="role-login">
      <div className="role-login__container">
        {/* Left Side - Image Section */}
        <div className="role-login__image-section">
          {/* Floating decorative elements */}
          <div className="role-login__floating role-login__floating--1"></div>
          <div className="role-login__floating role-login__floating--2"></div>
          <div className="role-login__floating role-login__floating--3"></div>

          {/* Medical Illustration */}
          <div className="role-login__illustration">
            <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background circle */}
              <circle cx="200" cy="200" r="180" fill="url(#bgGradient)" opacity="0.3" />

              {/* Main doctor figure */}
              <ellipse cx="200" cy="350" rx="80" ry="20" fill="#1a1f4e" opacity="0.2" />

              {/* Body/Coat */}
              <path d="M140 200 L140 320 Q140 340 160 340 L240 340 Q260 340 260 320 L260 200 Q260 160 200 160 Q140 160 140 200Z" fill="white" />
              <path d="M140 200 L140 320 Q140 340 160 340 L240 340 Q260 340 260 320 L260 200" stroke="#e0e5f0" strokeWidth="2" fill="none" />

              {/* Stethoscope */}
              <path d="M180 200 Q160 220 160 250 Q160 280 180 290" stroke="#667eea" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="180" cy="295" r="12" fill="#667eea" />
              <circle cx="180" cy="295" r="6" fill="#4a5cb8" />

              {/* Head */}
              <circle cx="200" cy="120" r="50" fill="#ffd5c8" />
              <circle cx="200" cy="120" r="50" stroke="#f5c4b5" strokeWidth="2" fill="none" />

              {/* Hair */}
              <path d="M155 100 Q155 60 200 60 Q245 60 245 100 Q245 80 200 85 Q155 80 155 100Z" fill="#2d3a8c" />

              {/* Face */}
              <circle cx="182" cy="115" r="4" fill="#2d3a8c" />
              <circle cx="218" cy="115" r="4" fill="#2d3a8c" />
              <path d="M190 135 Q200 142 210 135" stroke="#e8a090" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Collar */}
              <path d="M170 165 L200 185 L230 165" stroke="#e0e5f0" strokeWidth="2" fill="none" />

              {/* Medical cross badge */}
              <rect x="185" y="210" width="30" height="30" rx="6" fill="#667eea" />
              <path d="M200 218 L200 232 M193 225 L207 225" stroke="white" strokeWidth="3" strokeLinecap="round" />

              {/* Clipboard */}
              <rect x="240" cy="250" width="45" height="60" rx="4" fill="#f0f3ff" stroke="#667eea" strokeWidth="2" />
              <rect x="248" y="260" width="30" height="3" rx="1" fill="#667eea" opacity="0.5" />
              <rect x="248" y="268" width="25" height="3" rx="1" fill="#667eea" opacity="0.5" />
              <rect x="248" y="276" width="28" height="3" rx="1" fill="#667eea" opacity="0.5" />
              <rect x="248" y="284" width="20" height="3" rx="1" fill="#667eea" opacity="0.5" />

              {/* Floating medical icons */}
              <g transform="translate(80, 80)">
                <circle r="25" fill="white" opacity="0.9" />
                <path d="M0 -10 L0 10 M-10 0 L10 0" stroke="#f093fb" strokeWidth="3" strokeLinecap="round" />
              </g>

              <g transform="translate(320, 120)">
                <circle r="20" fill="white" opacity="0.9" />
                <path d="M-8 0 Q0 -8 8 0 Q0 8 -8 0" fill="#764ba2" />
              </g>

              <g transform="translate(100, 280)">
                <circle r="18" fill="white" opacity="0.9" />
                <path d="M-6 -2 L0 4 L8 -6" stroke="#667eea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>

              <defs>
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Branding text */}
          <div className="role-login__branding">
            <h1>Smart Telemedicine</h1>
            <p>Professional healthcare portal for doctors, pharmacies, and administrators</p>
          </div>

          {/* Feature badges */}
          <div className="role-login__features">
            <div className="role-login__feature-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Secure Access
            </div>
            <div className="role-login__feature-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              24/7 Available
            </div>
            <div className="role-login__feature-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              HIPAA Compliant
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="role-login__form-section">
          <div className="role-login__header">
            <span className="role-login__badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Staff Portal
            </span>
            <h2>Welcome Back!</h2>
            <p>Sign in to access your dashboard and manage your tasks</p>
          </div>

          <form className="role-login__form" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="role-login__field">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Select Your Role
              </label>
              <div className="role-login__roles">
                <label className="role-login__role-option">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={role === 'doctor'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-login__role-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    <span>Doctor</span>
                  </div>
                </label>
                <label className="role-login__role-option">
                  <input
                    type="radio"
                    name="role"
                    value="pharmacy"
                    checked={role === 'pharmacy'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-login__role-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    <span>Pharmacy</span>
                  </div>
                </label>
                <label className="role-login__role-option">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-login__role-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Admin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div className="role-login__field">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email Address
              </label>
              <div className="role-login__input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div className="role-login__field">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="role-login__input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="role-login__error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="role-login__buttons">
              <button type="submit" className="role-login__submit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Sign In to Dashboard
              </button>

              {showMessageAdmin && (
                <button
                  type="button"
                  className="role-login__message-admin"
                  onClick={() => navigate(`/message-admin?email=${encodeURIComponent(email)}`)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Contact Administrator
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="role-login__footer">
            <p>Are you a patient? <a href="/patient/login">Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleLogin
