import { useEffect, useState } from 'react'
import api from '../api/axios'
import PharmacyLayout from '../dashboard/PharmacyLayout.jsx'

const ProfileSettings = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const response = await api.get('pharmacy/profile/')
        setProfile(response.data)
      } catch (err) {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  return (
    <PharmacyLayout>
      <section className="pharmacy-card pharmacy-card-header">
        <div>
          <h2>Profile Settings</h2>
          <p className="pharmacy-muted">View your pharmacy account details.</p>
        </div>
      </section>

      <section className="pharmacy-card">
        {loading ? (
          <div className="pharmacy-empty">Loading profile...</div>
        ) : (
          <form className="pharmacy-form">
            <label>
              Pharmacy Name
              <input type="text" value={profile?.pharmacy_name || ''} disabled />
            </label>
            <label>
              Email
              <input type="email" value={profile?.email || ''} disabled />
            </label>
            <label>
              Location
              <input type="text" value={profile?.location || ''} disabled />
            </label>
            <label>
              Phone Number
              <input type="text" value={profile?.phone || ''} disabled />
            </label>
            <label>
              Status
              <input type="text" value={profile?.status || 'Active'} disabled />
            </label>
          </form>
        )}
      </section>
    </PharmacyLayout>
  )
}

export default ProfileSettings
