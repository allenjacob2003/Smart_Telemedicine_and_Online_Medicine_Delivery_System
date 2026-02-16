import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import './MessageAdmin.css'

const MessageAdmin = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [email, setEmail] = useState(params.get('email') || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await api.post('accounts/messages/', { email, message })
      setSuccess('Message sent successfully! The administrator will review it shortly.')
      setMessage('')
    } catch (err) {
      const apiError = err?.response?.data?.detail || 'Failed to send message. Please try again.'
      setError(apiError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="message-admin">
      <div className="message-admin__container">
        <div className="message-admin__card">
          <header className="message-admin__header">
            <div className="message-admin__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h1 className="message-admin__title">Contact Administrator</h1>
            <p className="message-admin__subtitle">
              Send a message to the admin team regarding your account status or any concerns you may have.
            </p>
          </header>

          <form className="message-admin__form" onSubmit={handleSubmit}>
            <div className="message-admin__field">
              <label htmlFor="admin-email" className="message-admin__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Your Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                className="message-admin__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="message-admin__field">
              <label htmlFor="admin-message" className="message-admin__label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
                Your Message
              </label>
              <textarea
                id="admin-message"
                className="message-admin__textarea"
                placeholder="Please describe your issue or concern in detail..."
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="message-admin__error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6"/>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="message-admin__success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {success}
              </div>
            )}

            <div className="message-admin__buttons">
              <button 
                type="button" 
                className="message-admin__button message-admin__button--outline" 
                onClick={() => navigate('/')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Home
              </button>
              <button 
                type="submit" 
                className="message-admin__button message-admin__button--primary"
                disabled={loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="message-admin__info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01"/>
            </svg>
            <div>
              <strong>Need urgent help?</strong> For immediate assistance, please contact our support team directly at support@smartmed.com or call +1-800-SMARTMED during business hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageAdmin
