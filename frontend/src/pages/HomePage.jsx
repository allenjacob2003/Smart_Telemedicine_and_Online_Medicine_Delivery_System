import { useNavigate } from 'react-router-dom'
import './HomePage.css'

const DoctorIllustration = () => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="home-illustration">
    {/* Background circle */}
    <circle cx="200" cy="200" r="180" fill="url(#bgGrad)" opacity="0.15" />
    <circle cx="200" cy="200" r="140" fill="url(#bgGrad)" opacity="0.1" />
    {/* Stethoscope */}
    <path d="M160 180 C160 140, 200 120, 220 140 C240 160, 240 200, 220 220" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="220" cy="228" r="14" fill="#0ea5e9" />
    <circle cx="220" cy="228" r="8" fill="#fff" />
    {/* Heart */}
    <path d="M185 170 C175 150, 145 155, 150 175 C155 195, 185 210, 185 210 C185 210, 215 195, 220 175 C225 155, 195 150, 185 170Z" fill="#ef4444" opacity="0.85" />
    {/* Cross */}
    <rect x="280" y="100" width="40" height="12" rx="4" fill="#10b981" />
    <rect x="294" y="86" width="12" height="40" rx="4" fill="#10b981" />
    {/* Pill */}
    <rect x="90" y="260" width="50" height="20" rx="10" fill="#8b5cf6" transform="rotate(-30 90 260)" />
    <rect x="90" y="260" width="25" height="20" rx="10" fill="#a78bfa" transform="rotate(-30 90 260)" />
    {/* Pulse line */}
    <polyline points="60,300 100,300 120,270 140,330 160,280 180,310 200,300 340,300" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
    {/* Shield */}
    <path d="M300 220 L300 250 C300 275 280 290 270 295 C260 290 240 275 240 250 L240 220 L270 210 Z" fill="#2563eb" opacity="0.2" stroke="#2563eb" strokeWidth="2" />
    <polyline points="255,245 265,260 285,235" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Floating dots */}
    <circle cx="80" cy="140" r="6" fill="#2563eb" opacity="0.3" className="home-float-dot" />
    <circle cx="330" cy="170" r="4" fill="#0ea5e9" opacity="0.4" className="home-float-dot" />
    <circle cx="120" cy="340" r="5" fill="#10b981" opacity="0.3" className="home-float-dot" />
    <circle cx="310" cy="320" r="7" fill="#8b5cf6" opacity="0.25" className="home-float-dot" />
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="400" y2="400">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
  </svg>
)

const FeatureIcon = ({ type }) => {
  const icons = {
    consultation: (
      <svg viewBox="0 0 48 48" fill="none" className="home-feat-svg">
        <rect width="48" height="48" rx="14" fill="url(#ic1)" />
        <circle cx="24" cy="18" r="7" stroke="#fff" strokeWidth="2.5" fill="none" />
        <path d="M12 38 C12 30, 18 26, 24 26 C30 26, 36 30, 36 38" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="36" cy="14" r="6" fill="#10b981" />
        <path d="M33 14 L35.5 16.5 L39 12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <defs><linearGradient id="ic1" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#2563eb" /><stop offset="1" stopColor="#0ea5e9" /></linearGradient></defs>
      </svg>
    ),
    prescription: (
      <svg viewBox="0 0 48 48" fill="none" className="home-feat-svg">
        <rect width="48" height="48" rx="14" fill="url(#ic2)" />
        <rect x="13" y="8" width="22" height="32" rx="4" stroke="#fff" strokeWidth="2.5" fill="none" />
        <line x1="18" y1="18" x2="30" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="24" x2="28" y2="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="30" x2="25" y2="30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 28 L38 34 M38 28 L32 34" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <defs><linearGradient id="ic2" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
      </svg>
    ),
    medicine: (
      <svg viewBox="0 0 48 48" fill="none" className="home-feat-svg">
        <rect width="48" height="48" rx="14" fill="url(#ic3)" />
        <rect x="14" y="16" width="20" height="22" rx="4" stroke="#fff" strokeWidth="2.5" fill="none" />
        <rect x="18" y="10" width="12" height="8" rx="3" stroke="#fff" strokeWidth="2.5" fill="none" />
        <line x1="24" y1="22" x2="24" y2="32" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="19" y1="27" x2="29" y2="27" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        <defs><linearGradient id="ic3" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#10b981" /><stop offset="1" stopColor="#34d399" /></linearGradient></defs>
      </svg>
    ),
    delivery: (
      <svg viewBox="0 0 48 48" fill="none" className="home-feat-svg">
        <rect width="48" height="48" rx="14" fill="url(#ic4)" />
        <rect x="6" y="18" width="24" height="16" rx="3" stroke="#fff" strokeWidth="2.5" fill="none" />
        <path d="M30 22 L38 22 L42 28 L42 34 L30 34 Z" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
        <circle cx="15" cy="36" r="4" stroke="#fff" strokeWidth="2.5" fill="none" />
        <circle cx="36" cy="36" r="4" stroke="#fff" strokeWidth="2.5" fill="none" />
        <defs><linearGradient id="ic4" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#fbbf24" /></linearGradient></defs>
      </svg>
    ),
  }
  return icons[type] || null
}

const HomePage = () => {
  const navigate = useNavigate()

  const handleLogin = () => navigate('/patient/login')
  const handleRegister = () => navigate('/patient/register')

  return (
    <div className="home-shell">
      {/* Decorative floating orbs */}
      <div className="home-orb home-orb-1" />
      <div className="home-orb home-orb-2" />
      <div className="home-orb home-orb-3" />

      <header className="home-nav">
        <div className="home-brand">
          <div className="home-logo">
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <rect x="10" y="4" width="12" height="4" rx="2" fill="#fff" />
              <rect x="4" y="10" width="24" height="18" rx="4" fill="#fff" />
              <line x1="16" y1="15" x2="16" y2="23" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              <line x1="12" y1="19" x2="20" y2="19" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>Smart Telemedicine</h1>
            <p>Online Medicine Delivery System</p>
          </div>
        </div>
        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#stats">About</a>
          <a href="#portal">Portal</a>
        </nav>
        <div className="home-actions">
          <button type="button" className="home-btn ghost" onClick={handleLogin}>
            Login
          </button>
          <button type="button" className="home-btn primary" onClick={handleRegister}>
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-hero">
        <div className="home-hero-image">
          <DoctorIllustration />
        </div>
        <div className="home-hero-content">
          <span className="home-badge">🏥 #1 Healthcare Platform</span>
          <h2>Your Health, <br /><span className="home-gradient-text">Our Priority</span></h2>
          <p className="home-description">
            Experience seamless consultations, instant prescriptions, and doorstep medicine delivery &mdash; 
            all in a single, secure platform designed for modern healthcare.
          </p>
          <div className="home-hero-btns">
            <button type="button" className="home-btn primary large" onClick={handleRegister}>
              Get Started Free
              <span className="home-btn-arrow">→</span>
            </button>
            <button type="button" className="home-btn ghost large" onClick={handleLogin}>
              Sign In
            </button>
          </div>
          <div className="home-trust">
            <div className="home-trust-avatars">
              <span className="home-avatar" style={{ background: '#2563eb' }}>D</span>
              <span className="home-avatar" style={{ background: '#10b981' }}>P</span>
              <span className="home-avatar" style={{ background: '#8b5cf6' }}>R</span>
              <span className="home-avatar" style={{ background: '#f59e0b' }}>S</span>
            </div>
            <p><strong>2,500+</strong> patients trust us daily</p>
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="home-stats" id="stats">
        <div className="home-stat-item">
          <div className="home-stat-icon">👨‍⚕️</div>
          <h3>150+</h3>
          <p>Expert Doctors</p>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-icon">👥</div>
          <h3>2,500+</h3>
          <p>Happy Patients</p>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-icon">💊</div>
          <h3>10,000+</h3>
          <p>Medicines Delivered</p>
        </div>
        <div className="home-stat-item">
          <div className="home-stat-icon">⭐</div>
          <h3>4.9/5</h3>
          <p>User Rating</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features-section" id="features">
        <div className="home-section-header">
          <span className="home-badge">✨ Our Services</span>
          <h2>Everything You Need for <span className="home-gradient-text">Better Health</span></h2>
        </div>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-left">
              <FeatureIcon type="consultation" />
            </div>
            <div className="home-feature-right">
              <h4>Request Consultation</h4>
              <p>Book appointments with specialists instantly and get expert care from the comfort of your home.</p>
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-left">
              <FeatureIcon type="prescription" />
            </div>
            <div className="home-feature-right">
              <h4>E-Prescription from Doctors</h4>
              <p>Receive digital prescriptions directly after your consultation &mdash; no paper needed.</p>
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-left">
              <FeatureIcon type="medicine" />
            </div>
            <div className="home-feature-right">
              <h4>Online Medicine Ordering</h4>
              <p>Browse and order medicines from our verified pharmacy with just a few clicks.</p>
            </div>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-left">
              <FeatureIcon type="delivery" />
            </div>
            <div className="home-feature-right">
              <h4>Order Tracking &amp; Delivery</h4>
              <p>Real-time tracking for your medicine orders with fast doorstep delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2026 Smart Telemedicine. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default HomePage
