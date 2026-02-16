import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import PatientLayout from '../dashboard/PatientLayout.jsx'

const normalizeAppointment = (item) => ({
  id: item.id,
  doctorName: item.doctor_name || item.doctorName || '—',
  department: item.department || item.department_name || '—',
  date: item.appointment_date || item.date || '—',
  time: item.appointment_time || item.time || '—',
  status: item.status || 'Confirmed',
})

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [timeFilter, setTimeFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const formatDate = (dateString) => {
    if (!dateString || dateString === '—') return '—'
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
    if (!timeString || timeString === '—') return '—'
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

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('patients/confirmed-appointments/', {
          params: { email },
        })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setAppointments(data.map(normalizeAppointment))
      } catch (err) {
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchDate = dateFilter ? appointment.date.includes(dateFilter) : true
      const matchTime = timeFilter ? appointment.time.includes(timeFilter) : true
      return matchDate && matchTime
    })
  }, [appointments, dateFilter, timeFilter])

  return (
    <PatientLayout>
      <section className="patient-card patient-card-header">
        <div>
          <h2>My Appointments</h2>
          <p className="patient-muted">View confirmed appointments.</p>
        </div>
        <div className="patient-filters">
          <label className="patient-filter">
            <span>Date</span>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </label>
          <label className="patient-filter">
            <span>Time</span>
            <input type="time" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="patient-card">
        {loading ? (
          <div className="patient-empty">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="patient-empty">No confirmed appointments found.</div>
        ) : (
          <div className="patient-grid">
            {filtered.map((appointment) => (
              <article className="patient-card" key={appointment.id}>
                <div className="patient-card-row">
                  <div>
                    <h3 className="patient-card-title">{appointment.doctorName}</h3>
                    <p className="patient-muted">{appointment.department}</p>
                  </div>
                  <span className="patient-pill">{appointment.status}</span>
                </div>
                <p className="patient-muted">
                  Date: <strong>{formatDate(appointment.date)}</strong>
                </p>
                <p className="patient-muted">
                  Time: <strong>{formatTime(appointment.time)}</strong>
                </p>
                {appointment.status === 'Rejected' && (
                  <div className="patient-warning">
                    Doctor rejected the appointment. Amount credited in 2–3 days.
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PatientLayout>
  )
}

export default MyAppointments
