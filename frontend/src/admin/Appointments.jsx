import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import './Appointments.css'

const normalizeAppointment = (item) => ({
  id: item.id,
  patientName:
    item.patient_name ||
    item.patientName ||
    item.patient?.name ||
    item.patient?.full_name ||
    item.patient?.user?.full_name ||
    item.patient?.user?.name ||
    '—',
  doctorName: item.doctor_name || item.doctorName || item.doctor?.name || '—',
  department: item.department || item.department_name || item.departmentName || '—',
  date: item.appointment_date || item.date || '—',
  time: item.appointment_time || item.time || '—',
  status: item.status || 'Confirmed',
})

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

const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('confirm')) return 'status-confirmed'
  if (normalized.includes('pending')) return 'status-pending'
  if (normalized.includes('cancel') || normalized.includes('reject')) return 'status-cancelled'
  return 'status-default'
}

const parseTimeToMinutes = (value) => {
  const s = String(value || '').trim()
  if (!s) return Number.POSITIVE_INFINITY
  const m24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (m24) return Number(m24[1]) * 60 + Number(m24[2])
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    let h = Number(m12[1]) % 12
    if (m12[3].toUpperCase() === 'PM') h += 12
    return h * 60 + Number(m12[2])
  }
  return Number.POSITIVE_INFINITY
}

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [patientSearch, setPatientSearch] = useState('')
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [dateSearch, setDateSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadAppointments = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await api.get('consultations/appointments/', { signal: controller.signal })

        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        const confirmedOnly = data.filter((a) => String(a?.status || '').toLowerCase().includes('confirm'))

        const normalizedSorted = confirmedOnly
          .map(normalizeAppointment)
          .sort((a, b) => {
            if (a.date !== b.date) return String(a.date).localeCompare(String(b.date))
            return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
          })

        setAppointments(normalizedSorted)
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
        setError('Unable to load appointments. Please try again.')
        setAppointments([])
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
    return () => controller.abort()
  }, [])

  const filteredAppointments = useMemo(() => {
    const hasSearch = patientSearch || departmentSearch || dateSearch
    if (!hasSearch) return appointments

    return appointments.filter((a) => {
      const patientValue = String(a.patientName || '').toLowerCase()
      const departmentValue = String(a.department || '').toLowerCase()
      const dateValue = String(a.date || '')

      const matchesPatient = patientSearch
        ? patientValue.includes(patientSearch.toLowerCase())
        : false
      const matchesDepartment = departmentSearch
        ? departmentValue.includes(departmentSearch.toLowerCase())
        : false
      const matchesDate = dateSearch ? dateValue.includes(dateSearch) : false

      return matchesPatient || matchesDepartment || matchesDate
    })
  }, [appointments, patientSearch, departmentSearch, dateSearch])

  return (
    <div className="admin-page admin-appointments">
      <div className="admin-appointments__header">
        <div>
          <h2 className="admin-appointments__title">Appointments</h2>
          <p className="admin-appointments__subtitle">Confirmed appointments from all departments</p>
        </div>

        <div className="admin-appointments__search">
          <input
            type="text"
            placeholder="Search patient"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="admin-appointments__searchInput"
          />
          <input
            type="text"
            placeholder="Search department"
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            className="admin-appointments__searchInput"
          />
          <input
            type="date"
            value={dateSearch}
            onChange={(e) => setDateSearch(e.target.value)}
            className="admin-appointments__searchInput"
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-appointments__state">Loading appointments...</div>
      ) : error ? (
        <div className="admin-appointments__state admin-appointments__state--error">{error}</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="admin-appointments__state">No data found</div>
      ) : (
        <div className="admin-appointments__grid">
          {filteredAppointments.map((a) => (
            <article
              className="admin-appointments__card"
              key={a.id || `${a.doctorName}-${a.date}-${a.time}`}
            >
              <div className="admin-appointments__cardTop">
                <div className="admin-appointments__names">
                  <div className="admin-appointments__patient">{a.patientName}</div>
                  <div className="admin-appointments__doctor">{a.doctorName}</div>
                </div>
                <span className={`admin-appointments__badge ${getStatusClass(a.status)}`}>
                  {a.status}
                </span>
              </div>

              <div className="admin-appointments__meta">
                <div className="admin-appointments__metaRow">
                  <span className="admin-appointments__metaLabel">Department</span>
                  <span className="admin-appointments__metaValue">{a.department}</span>
                </div>
                <div className="admin-appointments__metaRow">
                  <span className="admin-appointments__metaLabel">Appointment Date</span>
                  <span className="admin-appointments__metaValue">{formatDate(a.date)}</span>
                </div>
                <div className="admin-appointments__metaRow">
                  <span className="admin-appointments__metaLabel">Appointment Time</span>
                  <span className="admin-appointments__metaValue">{formatTime(a.time)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Appointments
