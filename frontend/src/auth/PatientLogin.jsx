import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import './PatientLogin.css'

const PatientLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [blockedInfo, setBlockedInfo] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBlockedInfo(null)
    setLoading(true)

    try {
      const response = await api.post('accounts/patient-login/', {
        email,
        password,
      })

      console.log('Login successful:', response.data)

      const { token, user } = response.data
      const role = user?.role || 'patient'
      const name = user?.name || 'Patient'

      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('email', email)
      localStorage.setItem('patientName', name)

      // Ensure state is saved before navigating
      setTimeout(() => {
        navigate('/patient/dashboard')
      }, 100)

    } catch (err) {
      console.error('Login error:', err)
      const responseData = err?.response?.data
      
      // Check if account is blocked
      if (responseData?.blocked) {
        setBlockedInfo({
          message: responseData.detail || 'Your account has been blocked.',
          contact_email: responseData.contact_email,
          contact_phone: responseData.contact_phone
        })
      } else {
        const message = responseData?.detail || 'Login failed'
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-login">
      {/* Floating animated shapes */}
      <div className="patient-login__bg-shapes">
        <span className="shape shape--1"></span>
        <span className="shape shape--2"></span>
        <span className="shape shape--3"></span>
        <span className="shape shape--4"></span>
        <span className="shape shape--5"></span>
      </div>

      <div className="patient-login__shell">
        {/* Left Hero Panel */}
        <section className="patient-login__hero">
          <div className="patient-login__hero-content">
            <div className="patient-login__logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="14" fill="url(#logo-grad)" />
                <path d="M24 12v24M12 24h24" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#6C63FF" />
                    <stop offset="1" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <span>SmartMed</span>
            </div>

            <h1 className="patient-login__hero-title">
              Your Health,<br />
              <span className="gradient-text">Our Priority</span>
            </h1>

            <p className="patient-login__hero-desc">
              Access world-class healthcare from the comfort of your home.
              Manage everything in one place.
            </p>

            <div className="patient-login__features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <strong>Health Records</strong>
                  <span>Instant access anytime</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                  <strong>Pharmacy Orders</strong>
                  <span>Track & manage deliveries</span>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div>
                  <strong>Live Consultation</strong>
                  <span>Chat with doctors 24/7</span>
                </div>
              </div>
            </div>

            <div className="patient-login__trust">
              <div className="trust-avatars">
                <span className="avatar avatar--1">A</span>
                <span className="avatar avatar--2">R</span>
                <span className="avatar avatar--3">S</span>
                <span className="avatar avatar--4">M</span>
              </div>
              <p><strong>2,500+</strong> patients trust SmartMed</p>
            </div>
          </div>
        </section>

        {/* Right Login Card */}
        <section className="patient-login__card" aria-label="Patient login form">
          <div className="patient-login__card-inner">
            <div className="patient-login__card-header">
              <div className="patient-login__welcome-icon">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3>Welcome Back!</h3>
            {blockedInfo && (
              <div className="patient-login__blocked">
                <div className="blocked-header">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h4>Account Blocked</h4>
                </div>
                <p className="blocked-message">{blockedInfo.message}</p>
                <div className="blocked-contact">
                  <h5>Contact Administrator:</h5>
                  <div className="contact-info">
                    {blockedInfo.contact_email && (
                      <div className="contact-item">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <a href={`mailto:${blockedInfo.contact_email}`}>{blockedInfo.contact_email}</a>
                      </div>
                    )}
                    {blockedInfo.contact_phone && (
                      <div className="contact-item">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <a href={`tel:${blockedInfo.contact_phone}`}>{blockedInfo.contact_phone}</a>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="blocked-message-button"
                    onClick={() => navigate(`/message-admin?email=${encodeURIComponent(email)}`)}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Send Message to Administrator
                  </button>
                </div>
              </div>
            )}

              <p>Sign in to your patient account</p>
            </div>

            {error && (
              <div className="patient-login__error">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="patient-login__form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="patient-email">Email Address</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <input
                    id="patient-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="patient-password">Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    id="patient-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <button
                type="submit"
                className="patient-login__submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    Sign In
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="patient-login__divider">
              <span>or</span>
            </div>

            <div className="patient-login__footer">
              <p>Don't have an account? <a href="/patient/register">Create Account</a></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PatientLogin
