import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import DoctorLayout from '../dashboard/DoctorLayout.jsx'

const normalizeAppointment = (item) => {
  const patientName =
    item.patient_name ||
    item.patientName ||
    item.patient?.name ||
    item.patient?.full_name ||
    item.patient?.user?.full_name ||
    item.patient?.user?.name ||
    'Unknown'

  const date = item.date || item.appointment_date || item.request_date || ''
  const time = item.time || item.appointment_time || item.slot_time || ''
  const department = item.department || item.doctor_department || item.patient?.department || 'General'
  const status = item.status || 'Confirmed'

  return {
    id: item.id,
    patientName,
    date,
    time,
    department,
    status,
  }
}

const Dashboard = () => {
  const [appointments, setAppointments] = useState([])
  const [dateFilter, setDateFilter] = useState('')
  const [timeFilter, setTimeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadAppointments = async () => {
      try {
        setLoading(true)
        const response = await api.get('doctors/confirmed-appointments/')
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        if (mounted) {
          setAppointments(data.map(normalizeAppointment))
          setError('')
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to load confirmed appointments. Please try again.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAppointments()
    return () => {
      mounted = false
    }
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesDate = dateFilter
        ? appointment.date?.toString().includes(dateFilter)
        : true
      const matchesTime = timeFilter
        ? appointment.time?.toString().includes(timeFilter)
        : true
      return matchesDate && matchesTime
    })
  }, [appointments, dateFilter, timeFilter])

  return (
    <DoctorLayout>
      <section className="doctor-card doctor-card-header">
        <div>
          <h2>Confirmed Appointments</h2>
          <p className="doctor-muted">Manage your approved consultations in one place.</p>
        </div>
        <div className="doctor-filters">
          <label className="doctor-filter">
            <span>Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </label>
          <label className="doctor-filter">
            <span>Time</span>
            <input
              type="time"
              value={timeFilter}
              onChange={(event) => setTimeFilter(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="doctor-card">
        {loading ? (
          <div className="doctor-empty">Loading confirmed appointments...</div>
        ) : error ? (
          <div className="doctor-empty doctor-error">{error}</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="doctor-empty">No confirmed appointments found.</div>
        ) : (
          <div className="doctor-table-wrapper">
            <table className="doctor-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.date || '—'}</td>
                    <td>{appointment.time || '—'}</td>
                    <td>{appointment.department}</td>
                    <td>
                      <span className="doctor-status">Confirmed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DoctorLayout>
  )
}

export default Dashboard
