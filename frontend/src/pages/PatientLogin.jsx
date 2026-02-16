import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import './PatientLogin.css'

const PatientLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [blockedInfo, setBlockedInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    // No auto-redirect — always show the login form when user visits this page.
    // If they're already logged in they can navigate via navbar/bookmark.
  }, [])

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBlockedInfo(null)
    setLoading(true)

    try {
      const response = await api.post('accounts/patient-login/', { email, password })

      // Backend currently returns: { message, user: {..}, display_name }
      const role = response?.data?.role || response?.data?.user?.role || 'patient'
      const token = response?.data?.token || getFallbackToken()
      const displayName = response?.data?.display_name || response?.data?.user?.full_name || 'Patient'

      devLog('[PatientLogin] login response:', response?.data)
      devLog('[PatientLogin] storing auth:', { tokenPresent: Boolean(token), role, email })

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('email', email)
      localStorage.setItem('patientName', displayName)

      if (role === 'patient') {
        navigate('/patient/dashboard', { replace: true })
      } else {
        // Defensive: if somehow a non-patient account hits this login, send them home.
        navigate('/', { replace: true })
      }
    } catch (err) {
      devLog('[PatientLogin] login error:', err)
      const responseData = err?.response?.data
      
      // Check if account is blocked
      if (responseData?.blocked) {
        setBlockedInfo({
          message: responseData.detail || 'Your account has been blocked.',
          contact_email: responseData.contact_email,
          contact_phone: responseData.contact_phone
        })
      } else {
        const message = responseData?.detail || 'Login failed. Please try again.'
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`pl-login-shell ${mounted ? 'pl-mounted' : ''}`}>
      {/* Left Hero Panel with Video */}
      <div className="pl-hero">
        <video
          className="pl-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80"
        >
          <source
            src="https://assets.mixkit.co/videos/1222/1222-720.mp4"
            type="video/mp4"
          />
        </video>
        <div className="pl-hero-overlay"></div>

        {/* Floating medical icons */}
        <div className="pl-floating">
          <div className="pl-float pl-f1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="pl-float pl-f2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="pl-float pl-f3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/>
            </svg>
          </div>
          <div className="pl-float pl-f4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="pl-float pl-f5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
        </div>

        <div className="pl-hero-content">
          <div className="pl-hero-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
              <path d="M24 12v24M12 24h24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="pl-hero-title">Welcome Back</h1>
          <p className="pl-hero-subtitle">Smart Telemedicine Platform</p>
          <div className="pl-hero-divider"></div>

          <div className="pl-hero-features">
            <div className="pl-hero-feature">
              <div className="pl-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <h3>Instant Access</h3>
                <p>View your records anytime</p>
              </div>
            </div>
            <div className="pl-hero-feature">
              <div className="pl-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3>Video Consults</h3>
                <p>Talk to doctors face-to-face</p>
              </div>
            </div>
            <div className="pl-hero-feature">
              <div className="pl-feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h3>E-Prescriptions</h3>
                <p>Digital prescriptions on the go</p>
              </div>
            </div>
          </div>

          <div className="pl-hero-trust">
            <div className="pl-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>HIPAA Compliant</span>
            </div>
            <div className="pl-trust-dot"></div>
            <div className="pl-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span>256-bit Encryption</span>
            </div>
            <div className="pl-trust-dot"></div>
            <div className="pl-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="pl-panel">
        <section className="pl-card">
          <header className="pl-card-head">
            <span className="pl-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Patient Portal
            </span>
            <h1>Sign in to your account</h1>
            <p>Access your health dashboard, appointments, and more</p>
          </header>

          <form className="pl-form" onSubmit={handleSubmit}>
            <div className="pl-field">
              <label htmlFor="pl-email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 7l-10 7L2 7"/>
                </svg>
                Email Address
              </label>
              <div className="pl-input-wrap">
                <input
                  id="pl-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pl-field">
              <label htmlFor="pl-password">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Password
              </label>
              <div className="pl-input-wrap pl-pass-wrap">
                <input
                  id="pl-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pl-toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pl-options">
              <label className="pl-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="pl-check-custom"></span>
                Remember me
              </label>
              <button type="button" className="pl-forgot" onClick={() => {}}>
                Forgot password?
              </button>
            </div>

            {blockedInfo && (
              <div className="pl-blocked">
                <div className="pl-blocked-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <strong>Account Blocked</strong>
                </div>
                <p className="pl-blocked-message">{blockedInfo.message}</p>
                <div className="pl-blocked-contact">
                  <h5>Contact Administrator:</h5>
                  {blockedInfo.contact_email && (
                    <div className="pl-contact-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="M22 7l-10 7L2 7"/>
                      </svg>
                      <a href={`mailto:${blockedInfo.contact_email}`}>{blockedInfo.contact_email}</a>
                    </div>
                  )}
                  {blockedInfo.contact_phone && (
                    <div className="pl-contact-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      <a href={`tel:${blockedInfo.contact_phone}`}>{blockedInfo.contact_phone}</a>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="pl-message-admin"
                  onClick={() => navigate(`/message-admin?email=${encodeURIComponent(email)}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Send Message to Administrator
                </button>
              </div>
            )}

            {error && (
              <p className="pl-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                {error}
              </p>
            )}

            <button type="submit" className="pl-submit" disabled={loading}>
              {loading ? (
                <span className="pl-spinner"></span>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="pl-divider">
            <span>or</span>
          </div>

          <div className="pl-links">
            <button type="button" className="pl-register-btn" onClick={() => navigate('/patient/register')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Create New Account
            </button>
            <button type="button" className="pl-home-btn" onClick={() => navigate('/')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Back to Home
            </button>
          </div>

          <div className="pl-terms">
            By signing in, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PatientLogin
