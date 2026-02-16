import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientLayout from '../dashboard/PatientLayout'
import api from '../api/axios'
import doctorArt from '../assets/doctor.svg'
import medicineArt from '../assets/medicine.svg'
import './DashboardHome.css'

const summaryIcons = {
	appointments: '📅',
	prescriptions: '📄',
	orders: '🛍️',
	records: '📂',
}

const DashboardHome = () => {
  const [summary, setSummary] = useState(null)
  const [nextAppointment, setNextAppointment] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const patientName = localStorage.getItem('patientName') || localStorage.getItem('name') || 'Patient'
  const navigate = useNavigate()

  const devLog = (...args) => {
    if (import.meta?.env?.DEV) console.log(...args)
  }

  useEffect(() => {
    const email = localStorage.getItem('email')
    const token = localStorage.getItem('token')

    devLog('[PatientDashboardHome] init:', {
      emailPresent: Boolean(email),
      tokenPresent: Boolean(token),
    })

    const loadSummary = async () => {
      try {
        const response = await api.get('patients/dashboard-summary/', { params: { email } })
        devLog('[PatientDashboardHome] summary:', response?.data)
        setSummary(response.data)
      } catch (err) {
        devLog('[PatientDashboardHome] summary error:', err)
        setSummary(null)
      }
    }

    const loadAppointments = async () => {
      try {
        const response = await api.get('patients/confirmed-appointments/', { params: { email } })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        devLog('[PatientDashboardHome] appointments count:', data.length)
        const upcoming = data.sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`))[0]
        setNextAppointment(upcoming || null)
      } catch (err) {
        devLog('[PatientDashboardHome] appointments error:', err)
        setNextAppointment(null)
      }
    }

    const loadPrescriptions = async () => {
      try {
        const response = await api.get('patients/prescriptions/', { params: { email } })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        devLog('[PatientDashboardHome] prescriptions count:', data.length)
        setPrescriptions(data.slice(0, 3))
      } catch (err) {
        devLog('[PatientDashboardHome] prescriptions error:', err)
        setPrescriptions([])
      }
    }

    Promise.all([loadSummary(), loadAppointments(), loadPrescriptions()]).finally(() => setLoading(false))
  }, [])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Upcoming Appointments',
        value: summary?.confirmed_appointments ?? 0,
        icon: summaryIcons.appointments,
        linkLabel: 'View Appointments',
        link: '/patient/appointments',
      },
      {
        title: 'Prescriptions Received',
        value: summary?.prescriptions_received ?? 0,
        icon: summaryIcons.prescriptions,
        linkLabel: 'View Prescriptions',
        link: '/patient/prescriptions',
      },
      {
        title: 'Medicine Orders',
        value: summary?.active_orders ?? 0,
        icon: summaryIcons.orders,
        linkLabel: 'Track Orders',
        link: '/patient/orders',
      },
      {
        title: 'Payments Done',
        value: summary?.payments_done ?? 0,
        icon: summaryIcons.records,
        linkLabel: 'Payments',
        link: '/patient/payments',
      },
    ],
    [summary],
  )

  return (
    <PatientLayout pageTitle="Patient Dashboard">
      {loading ? (
        <div className="pd-loading">
          <div className="pd-loading-spinner"></div>
          <span className="pd-loading-text">Loading your dashboard...</span>
        </div>
      ) : (
        <div className="pd-fade-in">
          <div className="pd-greeting-card">
            <div>
              <p>Hello, {patientName}</p>
              <h3>Welcome to your health portal!</h3>
              <span>Stay up to date with appointments, prescriptions, and more.</span>
            </div>
            <img src={doctorArt} alt="Doctor" />
          </div>

          <section className="pd-summary-row">
            {summaryCards.map((card) => (
              <article className="pd-summary-card" key={card.title}>
                <div className="pd-card-icon">{card.icon}</div>
                <div>
                  <p>{card.title}</p>
                  <h4>{card.value}</h4>
                </div>
                <button type="button" onClick={() => navigate(card.link)}>
                  {card.linkLabel}
                </button>
              </article>
            ))}
          </section>

          <section className="pd-two-column">
            <article className="pd-panel">
              <header>
                <h4>Next Appointment</h4>
                {nextAppointment ? (
                  <span>{nextAppointment.department || 'General'}</span>
                ) : null}
              </header>
              {nextAppointment ? (
                <div className="pd-appointment">
                  <h5>{nextAppointment.doctor_name || 'Assigned Doctor'}</h5>
                  <p>{nextAppointment.department || 'General Medicine'}</p>
                  <div className="pd-appointment-meta">
                    <p>
                      Date: <strong>{nextAppointment.appointment_date}</strong>
                    </p>
                    <p>
                      Time: <strong>{nextAppointment.appointment_time}</strong>
                    </p>
                  </div>
                  <button type="button">Join Video Call</button>
                </div>
              ) : (
                <p className="pd-empty">No upcoming appointments scheduled.</p>
              )}
            </article>

            <article className="pd-panel">
              <header>
                <h4>My Prescriptions</h4>
                <button type="button" onClick={() => navigate('/patient/prescriptions')}>
                  View All
                </button>
              </header>
              {prescriptions.length === 0 ? (
                <p className="pd-empty">No prescriptions available.</p>
              ) : (
                <ul className="pd-prescription-list">
                  {prescriptions.map((item) => (
                    <li key={item.id}>
                      <p>{item.medicines}</p>
                      <span>{new Date(item.date_issued).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          <section className="pd-actions-row">
            <article className="pd-action-card">
              <div>
                <h5>Order Medicines</h5>
                <p>Quickly order your medicines online.</p>
                <button type="button" onClick={() => navigate('/patient/order-medicines')}>
                  Order Now
                </button>
              </div>
              <img src={medicineArt} alt="Order medicines" />
            </article>
            <article className="pd-action-card secondary">
              <div>
                <h5>Track Orders</h5>
                <p>Keep an eye on your delivery progress.</p>
                <button type="button" onClick={() => navigate('/patient/orders')}>
                  Track Orders
                </button>
              </div>
            </article>
          </section>
        </div>
      )}
    </PatientLayout>
  )
}

export default DashboardHome
