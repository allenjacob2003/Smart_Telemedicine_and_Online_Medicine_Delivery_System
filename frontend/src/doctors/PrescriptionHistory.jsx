import { useEffect, useState } from 'react'
import api from '../api/axios'
import DoctorLayout from '../dashboard/DoctorLayout.jsx'

const normalizePrescription = (item) => {
  const patientName =
    item.patient_name ||
    item.patientName ||
    item.patient?.name ||
    item.patient?.full_name ||
    item.patient?.user?.full_name ||
    'Unknown'

  return {
    id: item.id,
    patientName,
    dateIssued: item.date_issued || item.created_at || item.date || '—',
    medicines: item.medicines || item.medicine_list || item.medication || '—',
    pdf: item.pdf || item.report || item.file_url || '',
  }
}

const PrescriptionHistory = () => {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        const email = localStorage.getItem('email')
        const response = await api.get('doctors/prescription-history/', {
          params: { email },
        })
        const data = Array.isArray(response.data) ? response.data : response.data?.results || []
        setPrescriptions(data.map(normalizePrescription))
        setError('')
      } catch (err) {
        setError('Unable to load prescription history.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  return (
    <DoctorLayout>
      <section className="doctor-card doctor-card-header">
        <div>
          <h2>Prescription History</h2>
          <p className="doctor-muted">Track all prescriptions issued to patients.</p>
        </div>
      </section>

      <section className="doctor-grid">
        {loading ? (
          <div className="doctor-empty">Loading prescription history...</div>
        ) : error ? (
          <div className="doctor-empty doctor-error">{error}</div>
        ) : prescriptions.length === 0 ? (
          <div className="doctor-empty">No prescriptions found.</div>
        ) : (
          prescriptions.map((record) => (
            <article className="doctor-card" key={record.id}>
              <div className="doctor-card-row">
                <div>
                  <h3 className="doctor-card-title">{record.patientName}</h3>
                  <p className="doctor-muted">Date Issued: {record.dateIssued}</p>
                </div>
                {record.pdf && (
                  <a className="doctor-link" href={record.pdf} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                )}
              </div>
              <p className="doctor-muted">Medicines: {record.medicines}</p>
            </article>
          ))
        )}
      </section>
    </DoctorLayout>
  )
}

export default PrescriptionHistory
