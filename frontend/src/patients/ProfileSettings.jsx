import { useEffect, useState } from 'react'
import api from '../api/axios'
import PatientLayout from '../dashboard/PatientLayout.jsx'
import './PatientComponents.css'

const ProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('patients/profile/', { params: { email } })
        const data = response.data || {}
        setFormData({
          name: data.full_name || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          age: data.age || '',
          gender: data.gender || '',
        })

        // Load profile image from backend response
        if (data.profile_image) {
          setProfileImage(data.profile_image)
          setImagePreview(data.profile_image)
          // IMPORTANT: Save image URL to localStorage for sidebar display
          localStorage.setItem('patientPhoto', data.profile_image)
        }
      } catch (err) {
        setMessage('Unable to load profile details.')
        setMessageType('error')
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
        setMessage('Image size should be less than 2MB')
        setMessageType('error')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setProfileImage(base64String)
        setImagePreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileImage('')
    setImagePreview('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      // Make sure image is included if it exists
      const updateData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
      }

      // Add profile image if it exists
      if (profileImage) {
        updateData.profile_image = profileImage
      } else if (profileImage === '') {
        // Send empty string to remove image
        updateData.profile_image = 'null'
      }

      const response = await api.post('patients/profile/update/', updateData)
      
      // Update state with response data to ensure image is immediately updated
      const updatedData = response.data
      setFormData({
        name: updatedData.full_name || updatedData.name || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        age: updatedData.age || '',
        gender: updatedData.gender || '',
      })

      // Update image with response from backend
      if (updatedData.profile_image) {
        setProfileImage(updatedData.profile_image)
        setImagePreview(updatedData.profile_image)
        // IMPORTANT: Save image URL to localStorage so it persists across page reloads
        localStorage.setItem('patientPhoto', updatedData.profile_image)
      } else if (!profileImage) {
        setProfileImage('')
        setImagePreview('')
        localStorage.removeItem('patientPhoto')
      }

      // Update patientName in localStorage
      localStorage.setItem('patientName', updatedData.full_name || updatedData.name || '')

      setMessage('Profile updated successfully.')
      setMessageType('success')

      // Optional: Clear message after 3 seconds
      setTimeout(() => {
        setMessage('')
      }, 3000)
    } catch (err) {
      setMessage('Failed to update profile.')
      setMessageType('error')
    }
  }

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>Profile Settings</h2>
          <p className="patient-muted">Update your personal details.</p>
        </div>
      </section>

      <section className="patient-card">
        {loading ? (
          <div className="patient-empty">Loading profile...</div>
        ) : (
          <form className="patient-form" onSubmit={handleSubmit}>
            <div className="profile-image-section">
              <div className="profile-image-container">
                <img
                  src={imagePreview || `https://ui-avatars.com/api/?name=${formData.name || 'Patient'}&background=0ea5e9&color=ffffff`}
                  alt="Profile"
                  className="profile-image-preview"
                  key={imagePreview || 'default'}
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                    title="Remove image"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="profile-image-actions">
                <label className="patient-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                <p className="upload-hint">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <label>
              Name
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={formData.email} disabled />
            </label>
            <label>
              Phone
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </label>
            <label>
              Age
              <input type="number" name="age" value={formData.age} onChange={handleChange} />
            </label>
            <label>
              Gender
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <div className="patient-actions">
              <button className="patient-btn patient-btn-primary" type="submit">
                Update Profile
              </button>
            </div>
            {message && (
              <div className={`patient-message ${messageType}`}>
                {message}
              </div>
            )}
          </form>
        )}
      </section>
    </PatientLayout>
  )
}

export default ProfileSettings
