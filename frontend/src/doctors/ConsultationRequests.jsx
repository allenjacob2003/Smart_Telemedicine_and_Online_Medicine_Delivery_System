import { useEffect, useState } from 'react'
import api from '../api/axios'
import DoctorLayout from '../dashboard/DoctorLayout.jsx'

const normalizeRequest = (item) => {
  const patientName =
    item.patient_name ||
    item.patientName ||
    item.patient?.name ||
    item.patient?.full_name ||
    item.patient?.user?.full_name ||
    item.patient?.user?.name ||
    'Unknown'

  const symptoms = item.symptoms || item.symptom_summary || item.summary || 'No symptoms provided'
  const requestedAt = item.requested_at || item.request_date || item.date || ''
  const requestedTime = item.requested_time || item.time || item.request_time || ''
  const preferredDate = item.preferred_date || item.request_date || ''
  const preferredTime = item.preferred_time || item.request_time || ''
  const status = item.status || 'Pending'
  const consultationFee = item.consultation_fee ?? item.consultationFee ?? 0
  const paymentStatus = item.payment_status || item.paymentStatus || 'Pending'

  return {
    id: item.id,
    patientName,
    symptoms,
    requestedAt,
    requestedTime,
    preferredDate,
    preferredTime,
    status,
    consultationFee,
    paymentStatus,
  }
}

const ConsultationRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return '—'
    try {
      // If it's a full datetime string
      if (timeString.includes('T') || timeString.includes(' ')) {
        const date = new Date(timeString)
        return date.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      }
      // If it's already just a time string (HH:MM or HH:MM:SS)
      const timeParts = timeString.split(':')
      if (timeParts.length >= 2) {
        let hours = parseInt(timeParts[0])
        const minutes = timeParts[1]
        const ampm = hours >= 12 ? 'PM' : 'AM'
        hours = hours % 12 || 12
        return `${hours}:${minutes} ${ampm}`
      }
      return timeString
    } catch {
      return timeString
    }
  }

  const loadRequests = async () => {
    try {
      setLoading(true)
      const email = localStorage.getItem('email')
      const response = await api.get('doctors/consultation-requests/', {
        params: { email },
      })
      const data = Array.isArray(response.data) ? response.data : response.data?.results || []
      setRequests(data.map(normalizeRequest))
      setError('')
    } catch (err) {
      setError('Unable to load consultation requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleAction = async (id, action) => {
    try {
      setActionId(id)
      if (action === 'approve') {
        await api.post(`doctors/approve-request/${id}/`)
      } else {
        await api.post(`doctors/reject-request/${id}/`)
      }
      await loadRequests()
    } catch (err) {
      setError('Action failed. Please try again.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <DoctorLayout>
      <section className="doctor-card doctor-card-header">
        <div>
          <h2>Consultation Requests</h2>
          <p className="doctor-muted">Review and respond to pending consultation requests.</p>
        </div>
      </section>

      <section className="doctor-grid">
        {loading ? (
          <div className="doctor-empty">Loading consultation requests...</div>
        ) : error ? (
          <div className="doctor-empty doctor-error">{error}</div>
        ) : requests.length === 0 ? (
          <div className="doctor-empty">No consultation requests found.</div>
        ) : (
          requests.map((request) => (
            <article className="doctor-card" key={request.id}>
              <div className="doctor-card-row">
                <div>
                  <h3 className="doctor-card-title">{request.patientName}</h3>
                  <p className="doctor-muted">{request.symptoms}</p>
                </div>
                <span className="doctor-pill">{request.status}</span>
              </div>
              <div className="doctor-card-meta">
                <span>Preferred Date: {formatDate(request.preferredDate)}</span>
                <span>Preferred Time: {formatTime(request.preferredTime)}</span>
                <span>Fee: ₹{Number(request.consultationFee).toFixed(2)}</span>
                <span>Payment: {request.paymentStatus}</span>
              </div>
              <div className="doctor-actions">
                <button
                  className="doctor-btn doctor-btn-primary"
                  type="button"
                  disabled={actionId === request.id}
                  onClick={() => handleAction(request.id, 'approve')}
                >
                  Approve
                </button>
                <button
                  className="doctor-btn doctor-btn-outline"
                  type="button"
                  disabled={actionId === request.id}
                  onClick={() => handleAction(request.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </DoctorLayout>
  )
}

export default ConsultationRequests
