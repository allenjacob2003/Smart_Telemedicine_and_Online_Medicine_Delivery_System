import { useEffect, useState } from 'react'
import api from '../api/axios'
import DoctorLayout from '../dashboard/DoctorLayout.jsx'
import './DoctorProfileSettings.css'

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    specialization: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [profileImage, setProfileImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [activeSection, setActiveSection] = useState('personal')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('doctors/profile/', { params: { email } })
        const data = response.data || {}
        setFormData({
          name: data.name || data.full_name || '',
          email: data.email || '',
          department: data.department || '',
          specialization: data.specialization || '',
          phone: data.phone || data.phone_number || '',
          password: '',
          confirmPassword: '',
        })

        const savedImage = localStorage.getItem('doctorPhoto')
        if (savedImage && !savedImage.includes('ui-avatars.com')) {
          setProfileImage(savedImage)
          setImagePreview(savedImage)
        }
      } catch (err) {
        setMessage({ text: 'Unable to load profile details.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'Image size should be less than 2MB', type: 'error' })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileImage('')
    setImagePreview('')
    localStorage.removeItem('doctorPhoto')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' })
      return
    }

    try {
      setSaving(true)
      const email = localStorage.getItem('email')
      const payload = {
        email,
        name: formData.name,
        department: formData.department,
        specialization: formData.specialization,
        phone: formData.phone,
      }
      if (formData.password) payload.password = formData.password

      await api.put('doctors/profile/update/', payload)

      if (profileImage) {
        localStorage.setItem('doctorPhoto', profileImage)
      }
      localStorage.setItem('doctorName', formData.name)

      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }))

      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const safeName = formData.name || 'Doctor'
  const avatarUrl =
    imagePreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=4f7cff&color=ffffff&size=160&bold=true`

  const sections = [
    { key: 'personal', label: 'Personal', icon: '👤' },
    { key: 'professional', label: 'Professional', icon: '🩺' },
    { key: 'security', label: 'Security', icon: '🔒' },
  ]

  if (loading) {
    return (
      <DoctorLayout>
        <div className="dps-loading">
          <div className="dps-loading-spinner" />
          <p>Loading your profile...</p>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="dps-container">
        {/* Toast Message */}
        {message.text && (
          <div className={`dps-toast dps-toast-${message.type}`}>
            <span className="dps-toast-icon">
              {message.type === 'success' ? '✓' : '⚠'}
            </span>
            <span>{message.text}</span>
            <button className="dps-toast-close" onClick={() => setMessage({ text: '', type: '' })}>×</button>
          </div>
        )}

        {/* Page Header */}
        <div className="dps-page-header">
          <div className="dps-page-header-content">
            <h1>Profile Settings</h1>
            <p>Manage your professional profile, contact details, and account security.</p>
          </div>
          <div className="dps-header-badge">
            <span>🛡️</span> Verified Doctor
          </div>
        </div>

        <form className="dps-form" onSubmit={handleSubmit}>
          <div className="dps-layout">
            {/* Left Column — Avatar Card */}
            <div className="dps-avatar-card">
              <div className="dps-avatar-wrapper">
                <img src={avatarUrl} alt="Profile" className="dps-avatar-img" />
                <label className="dps-avatar-edit" title="Change photo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  📷
                </label>
              </div>
              <h3 className="dps-avatar-name">Dr. {safeName}</h3>
              <span className="dps-avatar-role">{formData.specialization || formData.department || 'Medical Professional'}</span>
              <span className="dps-avatar-email">{formData.email}</span>

              <div className="dps-avatar-actions">
                <label className="dps-btn dps-btn-outline dps-btn-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {imagePreview && (
                  <button type="button" className="dps-btn dps-btn-ghost dps-btn-sm" onClick={removeImage}>
                    Remove
                  </button>
                )}
              </div>
              <p className="dps-avatar-hint">JPG, PNG — Max 2MB</p>

              {/* Quick Stats */}
              <div className="dps-quick-stats">
                <div className="dps-stat-item">
                  <span className="dps-stat-icon">📋</span>
                  <div>
                    <strong>{formData.department || '—'}</strong>
                    <small>Department</small>
                  </div>
                </div>
                <div className="dps-stat-item">
                  <span className="dps-stat-icon">⚕️</span>
                  <div>
                    <strong>{formData.specialization || '—'}</strong>
                    <small>Specialization</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Form Sections */}
            <div className="dps-form-area">
              {/* Section Nav */}
              <div className="dps-section-nav">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className={`dps-section-tab ${activeSection === s.key ? 'active' : ''}`}
                    onClick={() => setActiveSection(s.key)}
                  >
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>

              {/* Personal Section */}
              <div className={`dps-section ${activeSection === 'personal' ? 'active' : ''}`}>
                <div className="dps-section-header">
                  <h3>👤 Personal Information</h3>
                  <p>Your basic identity and contact details.</p>
                </div>
                <div className="dps-field-grid">
                  <div className="dps-field">
                    <label htmlFor="name">Full Name</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">👤</span>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                  <div className="dps-field">
                    <label htmlFor="email">Email Address</label>
                    <div className="dps-input-wrapper dps-input-disabled">
                      <span className="dps-input-icon">✉️</span>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                      />
                      <span className="dps-input-badge">Verified</span>
                    </div>
                    <small className="dps-field-hint">Email cannot be changed.</small>
                  </div>
                  <div className="dps-field dps-field-full">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">📱</span>
                      <input
                        id="phone"
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Section */}
              <div className={`dps-section ${activeSection === 'professional' ? 'active' : ''}`}>
                <div className="dps-section-header">
                  <h3>🩺 Professional Details</h3>
                  <p>Your medical department and specialization.</p>
                </div>
                <div className="dps-field-grid">
                  <div className="dps-field">
                    <label htmlFor="department">Department</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">🏥</span>
                      <input
                        id="department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g. Cardiology"
                        required
                      />
                    </div>
                  </div>
                  <div className="dps-field">
                    <label htmlFor="specialization">Specialization</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">⚕️</span>
                      <input
                        id="specialization"
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Interventional Cardiology"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className={`dps-section ${activeSection === 'security' ? 'active' : ''}`}>
                <div className="dps-section-header">
                  <h3>🔒 Account Security</h3>
                  <p>Change your password. Leave blank to keep current.</p>
                </div>
                <div className="dps-field-grid">
                  <div className="dps-field">
                    <label htmlFor="password">New Password</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">🔑</span>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="dps-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="dps-input-wrapper">
                      <span className="dps-input-icon">🔑</span>
                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                    </div>
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <small className="dps-field-error">Passwords do not match</small>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Bar */}
              <div className="dps-submit-bar">
                <button
                  type="submit"
                  className={`dps-btn dps-btn-primary ${saving ? 'dps-btn-loading' : ''}`}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="dps-btn-spinner" /> Saving...
                    </>
                  ) : (
                    <>💾 Update Profile</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DoctorLayout>
  )
}

export default ProfileSettings
