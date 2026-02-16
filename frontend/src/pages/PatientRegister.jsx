import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import './PatientRegister.css'

const PatientRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: 18,
    gender: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('accounts/patient-register/', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: Number(form.age),
        gender: form.gender,
        password: form.password,
      })
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/patient/login'), 1500)
    } catch (err) {
      const apiError =
        err?.response?.data?.detail ||
        err?.response?.data?.email?.[0] ||
        'Registration failed'
      const normalized = String(apiError).toLowerCase()
      const message =
        normalized.includes('already') || normalized.includes('exists')
          ? 'Email already exists. Please login.'
          : apiError
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    setStep(2)
  }

  const prevStep = () => {
    setStep(1)
  }

  const isStep1Valid = form.name && form.email && form.phone && form.age && form.gender

  return (
    <div className={`patient-register ${mounted ? 'mounted' : ''}`}>
      {/* Video Background Panel */}
      <div className="register-hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80"
        >
          <source
            src="https://assets.mixkit.co/videos/1222/1222-720.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-overlay"></div>

        {/* Floating medical icons */}
        <div className="floating-icons">
          <div className="float-icon float-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4.8 2.3A.3.3 0 0 1 5 2h4a.3.3 0 0 1 .3.3v5.4a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 1 .3.3v4a.3.3 0 0 1-.3.3h-5.4a.3.3 0 0 0-.3.3v5.4a.3.3 0 0 1-.3.3H5a.3.3 0 0 1-.2-.3v-5.4a.3.3 0 0 0-.3-.3H-.9a.3.3 0 0 1-.3-.3V8a.3.3 0 0 1 .3-.3h5.4a.3.3 0 0 0 .3-.3V2.3z" transform="translate(5 2) scale(0.8)"/>
            </svg>
          </div>
          <div className="float-icon float-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="float-icon float-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="float-icon float-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
          </div>
          <div className="float-icon float-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/>
            </svg>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="40" height="40" rx="12" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"/>
              <path d="M24 12v24M12 24h24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="hero-title">Smart Telemedicine</h1>
          <p className="hero-subtitle">Your Health, Our Priority</p>
          <div className="hero-divider"></div>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <h3>24/7 Health Monitoring</h3>
                <p>Real-time vitals tracking</p>
              </div>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3>Video Consultations</h3>
                <p>Face-to-face with top doctors</p>
              </div>
            </div>
            <div className="hero-feature">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h3>Secure & Private</h3>
                <p>HIPAA-compliant platform</p>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Patients</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">200+</span>
              <span className="stat-label">Doctors</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Panel */}
      <div className="register-panel">
        <div className="register-card">
          {/* Progress indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
            </div>
          </div>

          <div className="register-header">
            <span className="register-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              Patient Registration
            </span>
            <h2>{step === 1 ? 'Personal Information' : 'Secure Your Account'}</h2>
            <p>{step === 1
              ? 'Tell us about yourself to get started'
              : 'Create a strong password to protect your account'}
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            <div className={`form-step ${step === 1 ? 'active' : 'hidden'}`}>
              <div className="form-row">
                <label htmlFor="name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="email">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M22 7l-10 7L2 7"/>
                  </svg>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="phone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Phone Number
                </label>
                <div className="input-wrapper">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-row">
                  <label htmlFor="age">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    Age
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="age"
                      type="number"
                      className="age-input"
                      min="0"
                      step="1"
                      value={form.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="gender">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v8M8 12h8"/>
                    </svg>
                    Gender
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      required
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="register-button next-btn"
                onClick={nextStep}
                disabled={!isStep1Valid}
              >
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Step 2: Password */}
            <div className={`form-step ${step === 2 ? 'active' : 'hidden'}`}>
              <div className="form-row">
                <label htmlFor="password">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="confirmPassword">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password strength tips */}
              <div className="password-tips">
                <p className="tips-title">Password requirements:</p>
                <ul>
                  <li className={form.password.length >= 8 ? 'met' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? 'met' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(form.password) ? 'met' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    One number
                  </li>
                  <li className={form.password && form.confirmPassword && form.password === form.confirmPassword ? 'met' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Passwords match
                  </li>
                </ul>
              </div>

              {error && (
                <p className="form-message error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                  {error}
                </p>
              )}
              {success && (
                <p className="form-message success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>
                  </svg>
                  {success}
                </p>
              )}

              <div className="button-group">
                <button type="button" className="back-btn" onClick={prevStep}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back
                </button>
                <button type="submit" className="register-button" disabled={loading}>
                  {loading ? (
                    <span className="btn-loader"></span>
                  ) : (
                    <>
                      Create Account
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="login-link">
            <span>Already have an account? </span>
            <button type="button" onClick={() => navigate('/patient/login')}>
              Sign In
            </button>
          </div>

          <div className="terms-text">
            By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientRegister
